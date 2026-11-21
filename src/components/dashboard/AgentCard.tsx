import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Agent } from "../../types/agent";
import { Button } from "../ui/button";
import {
  Bot,
  Pencil,
  Trash2,
  BookOpen,
  Wrench,
  Power,
  Clock,
  Sparkles,
  Play,
} from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onToggleStatus: (agent: Agent) => Promise<void>;
  onRun?: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit, onDelete, onToggleStatus, onRun }: AgentCardProps) {
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);

  const handleRun = () => {
    if (onRun) {
      onRun(agent);
    } else {
      navigate(`/agents/${agent._id}/chat`);
    }
  };

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await onToggleStatus(agent);
    } finally {
      setIsToggling(false);
    }
  };

  const formattedDate = agent.createdAt
    ? new Date(agent.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="group relative bg-[#180d34]/70 hover:bg-[#1f1042]/90 border border-white/10 hover:border-purple-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-md transition-all duration-300 shadow-md hover:shadow-purple-500/10 flex flex-col justify-between">
      <div>
        {/* Top Header: Icon + Name + Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={handleRun}
              className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.2)] cursor-pointer"
              title="Click to Run & Chat"
            >
              <Bot className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3
                onClick={handleRun}
                className="text-base sm:text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors cursor-pointer"
                title="Click to Run & Chat"
              >
                {agent.name}
              </h3>
              {formattedDate && (
                <div className="flex items-center gap-1 text-[11px] text-white/40">
                  <Clock className="w-3 h-3" />
                  <span>Created {formattedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Status Badge */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            title={agent.isActive ? "Click to deactivate" : "Click to activate"}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              agent.isActive
                ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/25"
                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                agent.isActive ? "bg-emerald-400 animate-pulse" : "bg-white/30"
              }`}
            />
            <span>{agent.isActive ? "Active" : "Inactive"}</span>
          </button>
        </div>

        {/* Instructions / Prompt Snippet */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-purple-300/80 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Instructions
          </div>
          <p className="text-xs sm:text-sm text-purple-100/80 line-clamp-3 leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5 font-mono">
            {agent.instructions}
          </p>
        </div>

        {/* Knowledge Base (if present) */}
        {agent.knowledgeBase && (
          <div className="mb-4 flex items-start gap-2 text-xs text-purple-200/70 bg-purple-500/10 border border-purple-400/20 p-2 rounded-lg">
            <BookOpen className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
            <div className="truncate">
              <span className="font-semibold text-purple-200">KB: </span>
              <span className="text-purple-300/90">{agent.knowledgeBase}</span>
            </div>
          </div>
        )}

        {/* Tools Section */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-white/60 mb-1.5 flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            Tools ({agent.tools?.length || 0})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {agent.tools && agent.tools.length > 0 ? (
              agent.tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-purple-200 font-medium"
                >
                  {tool}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-white/40 italic">No tools selected</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-2">
        <Button
          size="sm"
          onClick={handleRun}
          className="h-8 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.35)] cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Run</span>
        </Button>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={isToggling}
            className="text-xs text-white/70 hover:text-white hover:bg-white/10 gap-1.5 h-8 px-2 cursor-pointer"
            title={agent.isActive ? "Pause agent" : "Resume agent"}
          >
            <Power className={`w-3.5 h-3.5 ${agent.isActive ? "text-emerald-400" : "text-white/40"}`} />
            <span className="hidden sm:inline">{agent.isActive ? "Pause" : "Resume"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(agent)}
            className="h-8 px-2.5 bg-white/5 hover:bg-purple-500/20 text-purple-200 border-white/15 hover:border-purple-400/40 text-xs gap-1 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(agent)}
            className="h-8 px-2.5 bg-white/5 hover:bg-red-500/20 text-red-300 border-white/15 hover:border-red-400/40 text-xs gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AgentCard;

