import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { agentApi } from "../axios/agentApi";
import { aiEngineApi } from "../axios/aiEngineApi";
import type { Agent } from "../types/agent";
import { ActionApprovalCard, type ActionPlan } from "../components/chat/ActionApprovalCard";
import { ChatMessageContent } from "../components/chat/ChatMessageContent";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bot,
  Sparkles,
  BookOpen,
  Wrench,
  Send,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  timestamp: string;
  executionId?: string;
  actionPlan?: ActionPlan;
  status?: "pending" | "awaiting_approval" | "running" | "completed" | "failed" | "sent" | "cancelled";
  progress?: number;
  step?: string;
  progressMessage?: string;
}

const AI_ENGINE_BASE_URL =
  import.meta.env.VITE_AI_ENGINE_URL || "http://localhost:8000";

const TERMINAL_STATUSES = new Set(["completed", "sent", "cancelled", "failed"]);

function formatChatTime(ts?: string): string {
  const date = ts ? new Date(ts) : new Date();
  return Number.isNaN(date.getTime())
    ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function upsertChatMessage(
  prev: ChatMessage[],
  incoming: ChatMessage & { clientTempId?: string }
): ChatMessage[] {
  const { clientTempId, ...cleanIncoming } = incoming;
  const idx = prev.findIndex(
    (m) =>
      m.id === cleanIncoming.id ||
      (clientTempId && m.id === clientTempId) ||
      (cleanIncoming.executionId && m.executionId === cleanIncoming.executionId)
  );

  if (idx === -1) {
    return [...prev, cleanIncoming];
  }

  const existing = prev[idx];
  const existingTerminal = Boolean(existing.status && TERMINAL_STATUSES.has(existing.status));
  const next = [...prev];
  next[idx] = {
    ...existing,
    ...cleanIncoming,
    id: cleanIncoming.id.startsWith("temp-") ? existing.id : cleanIncoming.id,
    text: existingTerminal ? existing.text : cleanIncoming.text,
    status: existingTerminal ? existing.status : cleanIncoming.status,
    actionPlan: cleanIncoming.actionPlan ?? existing.actionPlan,
    progress:
      existing.progress !== undefined &&
      cleanIncoming.progress !== undefined &&
      existing.progress > cleanIncoming.progress
        ? existing.progress
        : cleanIncoming.progress ?? existing.progress,
    step: existingTerminal ? existing.step : cleanIncoming.step ?? existing.step,
    progressMessage: existingTerminal
      ? existing.progressMessage
      : cleanIncoming.progressMessage ?? existing.progressMessage,
  };
  return next;
}

export function AgentChat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loggedUser = useAppSelector((state) => state.user.loggedUser);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Chat message state
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const completedToastsRef = useRef<Set<string>>(new Set());

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // 1. Fetch Agent Details & Existing History from AI-Engine
  useEffect(() => {
    const fetchAgentAndHistory = async () => {
      try {
        setLoading(true);

        // Fetch Agent Info from Node-server
        const agentRes = await agentApi.get(`/${id}`);
        if (!agentRes.data?.success || !agentRes.data.data) {
          toast.error("Agent not found");
          navigate("/dashboard");
          return;
        }
        const agentData: Agent = agentRes.data.data;
        setAgent(agentData);

        // Fetch persistent chat history from AI-Engine
        try {
          const historyRes = await aiEngineApi.get(`/chat/${id}/history`);
          const existing = historyRes.data?.data?.messages || [];

          if (existing.length > 0) {
            const formatted: ChatMessage[] = existing.map((m: any) => ({
              id: m.id || m._id || `msg-${Date.now()}`,
              sender: m.sender === "user" ? "user" : "agent",
              text: m.text,
              timestamp: formatChatTime(m.timestamp),
              executionId: m.executionId,
              actionPlan: m.actionPlan,
              status: m.status || (m.executionId ? "completed" : undefined),
              progress:
                m.status === "completed" || m.status === "sent" ? 100 : undefined,
            }));
            setMessages(formatted);
          } else {
            // Welcome message
            setMessages([
              {
                id: "welcome-1",
                sender: "agent",
                text: `Hello! I am ${agentData.name}. I'm ready to assist you based on my custom instructions${agentData.tools?.length ? ` and connected tools (${agentData.tools.join(", ")})` : ""
                  }. How can I help you today?`,
                timestamp: formatChatTime(),
              },
            ]);
          }
        } catch {
          setMessages([
            {
              id: "welcome-fallback",
              sender: "agent",
              text: `Hello! I am ${agentData.name}. How can I assist you today?`,
              timestamp: formatChatTime(),
            },
          ]);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load agent");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAgentAndHistory();
    }
  }, [id, navigate]);

  // 2. Direct WebSocket Connection scoped to (userId, agentId) for live progress & multi-device sync
  useEffect(() => {
    if (!loggedUser?._id || !id) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;

    const connectWebSocket = () => {
      if (isDisposed) return;

      try {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = AI_ENGINE_BASE_URL.replace(/^https?:\/\//, "");
        const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${loggedUser._id}/${id}`;

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`⚡ [AI-Engine WS] Connected to room [${loggedUser._id}:${id}]`);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("⚡ [AI-Engine WS] Live event:", data);

            // Guard against cross-agent event or toast bleed
            if (data.agentId && data.agentId !== id) {
              return;
            }

            if (data.type === "agent:message:new" && data.message) {
              const incoming: ChatMessage & { clientTempId?: string } = {
                id: data.message.id,
                clientTempId: data.message.clientTempId,
                sender: data.message.sender === "user" ? "user" : "agent",
                text: data.message.text,
                timestamp: formatChatTime(data.message.timestamp),
                executionId: data.message.executionId || undefined,
                actionPlan: data.message.actionPlan || undefined,
                status: data.message.status,
                progress: data.message.progress,
                step: data.message.step,
                progressMessage: data.message.progressMessage,
              };
              setMessages((prev) => upsertChatMessage(prev, incoming));
            } else if (data.type === "agent:execution:updated" && data.executionId) {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.executionId !== data.executionId) return msg;
                  if (msg.status && TERMINAL_STATUSES.has(msg.status)) return msg;

                  return {
                    ...msg,
                    status: data.status || msg.status,
                    text: data.text || msg.text,
                    progress: data.progress ?? msg.progress,
                    step: data.step ?? msg.step,
                    progressMessage: data.progressMessage ?? msg.progressMessage,
                    actionPlan:
                      data.params && msg.actionPlan
                        ? { ...msg.actionPlan, params: data.params }
                        : msg.actionPlan,
                  };
                })
              );
            } else if (data.type === "agent:task:progress") {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (
                    msg.executionId === data.executionId &&
                    (!msg.status || !TERMINAL_STATUSES.has(msg.status))
                  ) {
                    return {
                      ...msg,
                      status: "running",
                      progress: data.progress,
                      step: data.step,
                      progressMessage: data.message,
                    };
                  }
                  return msg;
                })
              );
            } else if (data.type === "agent:task:completed") {
              if (data.executionId && !completedToastsRef.current.has(data.executionId)) {
                completedToastsRef.current.add(data.executionId);
                toast.success(`Completed: ${data.message}`);
              }

              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.executionId === data.executionId) {
                    return {
                      ...msg,
                      status: "completed",
                      progress: 100,
                      step: "completed",
                      text: data.message || msg.text,
                    };
                  }
                  return msg;
                })
              );
            }
          } catch (err) {
            console.warn("WebSocket parse error:", err);
          }
        };

        ws.onclose = () => {
          if (isDisposed) return;
          console.log("⚡ [AI-Engine WS] Closed, reconnecting in 3s...");
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (err) => {
          console.warn("WebSocket error:", err);
          ws?.close();
        };
      } catch (err) {
        console.warn("WebSocket initialization error:", err);
      }
    };

    connectWebSocket();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [loggedUser?._id, id]);

  // 3. Human-in-the-Loop Execution Handlers
  const handleApproveExecution = async (
    executionId: string,
    editedParams?: Record<string, any>
  ) => {
    try {
      await aiEngineApi.post(`/chat/executions/${executionId}/approve`, {
        params: editedParams,
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.executionId === executionId && msg.status === "awaiting_approval"
            ? {
                ...msg,
                status: "running",
                progress: 10,
                step: "task_accepted",
                progressMessage: "Approved by user. Queued for worker execution...",
                actionPlan:
                  editedParams && msg.actionPlan
                    ? { ...msg.actionPlan, params: editedParams }
                    : msg.actionPlan,
              }
            : msg
        )
      );
      toast.success("Task approved and queued for execution");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to approve task");
    }
  };

  const handleSaveDraftExecution = async (
    executionId: string,
    editedParams: Record<string, any>
  ) => {
    try {
      await aiEngineApi.patch(`/chat/executions/${executionId}`, {
        params: editedParams,
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.executionId === executionId && msg.actionPlan
            ? { ...msg, actionPlan: { ...msg.actionPlan, params: editedParams } }
            : msg
        )
      );
      toast.success("Draft updated");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update draft");
    }
  };

  const handleCancelExecution = async (executionId: string) => {
    try {
      await aiEngineApi.post(`/chat/executions/${executionId}/cancel`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.executionId === executionId
            ? {
                ...msg,
                status: "cancelled",
                text: "Task ended by user. This action will not be processed.",
              }
            : msg
        )
      );
      toast.info("Task ended permanently");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to end task");
    }
  };

  // 4. Send Message Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    const clientTempId = `temp-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setInputMessage("");

    // 1. Add optimistic user message to UI immediately
    const userMsg: ChatMessage = {
      id: clientTempId,
      sender: "user",
      text: userText,
      timestamp: formatChatTime(),
    };

    setMessages((prev) => upsertChatMessage(prev, userMsg));
    setIsSending(true);

    try {
      // 2. Call AI-Engine directly (broadcasts user + assistant messages to same-agent devices)
      const res = await aiEngineApi.post("/chat", {
        agentId: id,
        message: userText,
        clientTempId,
      });

      if (res.data?.success && res.data.data) {
        const payload = res.data.data;
        const isAwaiting = Boolean(payload.awaitingApproval || payload.status === "awaiting_approval");
        const execId = payload.executionId;

        const agentReply: ChatMessage = {
          id: payload.messageId || `agent-${Date.now()}`,
          sender: "agent",
          text: payload.response || "Processing...",
          timestamp: formatChatTime(payload.timestamp),
          executionId: execId,
          actionPlan: payload.actionPlan || undefined,
          status: isAwaiting ? "awaiting_approval" : "completed",
        };

        setMessages((prev) => upsertChatMessage(prev, agentReply));
      } else {
        throw new Error(res.data?.message || "Invalid response format from agent");
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Could not connect to AI Engine (http://localhost:8000).";
      toast.error(errorMsg);

      const errorReply: ChatMessage = {
        id: `agent-err-${Date.now()}`,
        sender: "agent",
        text: `[Error]: ${errorMsg}`,
        timestamp: formatChatTime(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0720] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-xs text-purple-200/70">Loading agent workspace...</p>
        </div>
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="h-screen bg-[#0e0720] text-slate-100 flex flex-col overflow-hidden relative selection:bg-purple-500 selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[300px] bg-purple-700/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[300px] bg-indigo-700/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="h-14 border-b border-white/10 bg-[#12072b]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-white/70 hover:text-white hover:bg-white/5 h-8 px-2 gap-1.5 cursor-pointer text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>

          <div className="h-4 w-px bg-white/10" />

          {/* Agent Identity Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-white truncate max-w-[160px] sm:max-w-xs">
                  {agent.name}
                </h1>
                <span
                  className={`w-2 h-2 rounded-full ${agent.isActive ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"
                    }`}
                  title={agent.isActive ? "Active" : "Inactive"}
                />
              </div>
              <p className="text-[10px] text-purple-200/60 hidden sm:block">
                AI Engine • Sliding Window Context • Live WebSocket Worker
              </p>
            </div>
          </div>
        </div>

        {/* Right Action: Toggle Info Sidebar */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInfoSidebar(!showInfoSidebar)}
            className="h-8 px-2.5 bg-white/5 hover:bg-white/10 text-white border-white/15 text-xs gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">Agent Info</span>
            {showInfoSidebar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </header>

      {/* Main Container: Chat + Info Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0e0720]/80">
          {/* Status banner */}
          <div className="px-4 py-2 bg-purple-950/40 border-b border-purple-500/20 flex items-center justify-between text-xs text-purple-200/80">
            <div className="flex items-center gap-2 truncate">
              <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">
                Direct AI-Engine Connection • LangGraph Sliding Window & Background Worker Active
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0 border border-emerald-500/30">
              Live WS Connected
            </span>
          </div>

          {/* Scrollable Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAgent = msg.sender === "agent";
              const isRunning = msg.status === "running";
              const isCompleted =
                (msg.status === "completed" || msg.status === "sent") && msg.executionId;
              const isFailed = msg.status === "failed";

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-2xl ${isAgent ? "mr-auto" : "ml-auto flex-row-reverse"
                    }`}
                >
                  {/* Sender Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${isAgent
                        ? "bg-purple-600/25 border border-purple-400/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                        : "bg-indigo-600 text-white shadow-sm"
                      }`}
                  >
                    {isAgent ? <Bot className="w-4 h-4" /> : "You"}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${isAgent
                        ? "bg-[#180d34]/90 border border-white/10 text-white/90 shadow-md rounded-tl-xs"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] rounded-tr-xs"
                      }`}
                  >
                    <ChatMessageContent content={msg.text} isAgent={isAgent} />

                    {/* Human-in-the-Loop Approval / Edit / End Task Card */}
                    {isAgent &&
                      msg.actionPlan &&
                      msg.executionId &&
                      (msg.status === "awaiting_approval" || msg.status === "cancelled") && (
                        <ActionApprovalCard
                          executionId={msg.executionId}
                          actionPlan={msg.actionPlan}
                          status={msg.status}
                          onApprove={handleApproveExecution}
                          onSaveDraft={handleSaveDraftExecution}
                          onCancel={handleCancelExecution}
                        />
                      )}

                    {/* Live Progress Bar for RabbitMQ Worker Tasks */}
                    {isRunning && (
                      <div className="mt-3 pt-2.5 border-t border-purple-500/20">
                        <div className="flex items-center justify-between text-[11px] text-purple-300 mb-1.5 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 animate-pulse text-purple-400" />
                            {msg.progressMessage || "Processing action in background..."}
                          </span>
                          <span className="font-mono text-purple-200">{msg.progress || 25}%</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden p-0.5 border border-purple-500/30">
                          <div
                            className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                            style={{ width: `${Math.min(100, Math.max(10, msg.progress || 25))}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Completion Badge */}
                    {isCompleted && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Action successfully delivered via RabbitMQ worker</span>
                      </div>
                    )}

                    {/* Failure Badge */}
                    {isFailed && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Action execution failed</span>
                      </div>
                    )}

                    <div className={`text-[10px] mt-1.5 ${isAgent ? "text-white/40" : "text-white/70"}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thinking indicator */}
            {isSending && (
              <div className="flex items-start gap-3 max-w-2xl mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-purple-600/25 border border-purple-400/40 text-purple-300">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-[#180d34]/90 border border-white/10 text-xs text-purple-200/80 shadow-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>{agent.name} is thinking & planning...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-[#12072b]/90 border-t border-white/10 backdrop-blur-md">
            <form
              onSubmit={handleSendMessage}
              className="max-w-4xl mx-auto flex items-center gap-2 bg-black/40 border border-white/15 rounded-2xl p-1.5 focus-within:border-purple-400 transition-colors"
            >
              <input
                type="text"
                value={inputMessage}
                disabled={isSending}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${agent.name} anything or give a task (e.g. "Send an email to alex@gmail.com with subject Meeting")...`}
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none disabled:opacity-50"
              />

              <Button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.35)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </main>

        {/* Right Info Sidebar */}
        <aside
          className={`w-full sm:w-80 lg:w-96 shrink-0 bg-[#150a30] border-l border-white/10 flex flex-col transition-all duration-300 absolute sm:static inset-y-0 right-0 z-20 ${showInfoSidebar ? "translate-x-0" : "translate-x-full sm:translate-x-0 sm:block hidden"
            }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Agent Overview</h2>
            </div>
            <button
              onClick={() => setShowInfoSidebar(false)}
              className="sm:hidden text-white/60 hover:text-white text-xs px-2 py-1 bg-white/5 rounded"
            >
              Close
            </button>
          </div>

          {/* Sidebar Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-purple-200/80">
            {/* Agent Card Highlight */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Active and Ready
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold tracking-wide uppercase text-[10px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instructions / System Prompt</span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-white/80 leading-relaxed max-h-48 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap">
                {agent.instructions}
              </div>
            </div>

            {/* Knowledge Base */}
            {agent.knowledgeBase && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-purple-300 font-semibold tracking-wide uppercase text-[10px]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Knowledge Base</span>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-white/80 leading-relaxed max-h-36 overflow-y-auto text-[11px] whitespace-pre-wrap">
                  {agent.knowledgeBase}
                </div>
              </div>
            )}

            {/* Tools */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold tracking-wide uppercase text-[10px]">
                <Wrench className="w-3.5 h-3.5" />
                <span>Active Tools ({agent.tools?.length || 0})</span>
              </div>
              {agent.tools && agent.tools.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {agent.tools.map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-200 text-[11px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-[11px] italic">No tools connected</p>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-2 border-t border-white/10 space-y-2 text-[11px] text-white/50">
              <div className="flex items-center justify-between">
                <span>Agent ID:</span>
                <span className="font-mono text-white/70 truncate max-w-[140px]">{agent._id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span className="flex items-center gap-1 text-white/70">
                  <Clock className="w-3 h-3" />
                  {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "Recently"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
