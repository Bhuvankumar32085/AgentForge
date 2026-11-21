import { useState, useEffect } from "react";
import type { Agent, AgentFormData } from "../../types/agent";
import { Button } from "../ui/button";
import {
  X,
  Bot,
  Sparkles,
  BookOpen,
  Wrench,
  Plus,
  Loader2,
  Check,
} from "lucide-react";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgentFormData) => Promise<void>;
  initialData?: Agent | null;
}

const PRESET_TOOLS = [
  "Gmail",
  "Google Calendar",
  "Instagram",
  "Web Search",
  "Slack",
  "Custom Webhook",
];

export function AgentModal({ isOpen, onClose, onSubmit, initialData }: AgentModalProps) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; instructions?: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setInstructions(initialData.instructions || "");
      setKnowledgeBase(initialData.knowledgeBase || "");
      setTools(initialData.tools || []);
      setIsActive(typeof initialData.isActive === "boolean" ? initialData.isActive : true);
    } else {
      setName("");
      setInstructions("");
      setKnowledgeBase("");
      setTools(["Gmail", "Google Calendar"]);
      setIsActive(true);
    }
    setCustomTool("");
    setErrors({});
  }, [initialData, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const toggleTool = (tool: string) => {
    if (tools.includes(tool)) {
      setTools(tools.filter((t) => t !== tool));
    } else {
      setTools([...tools, tool]);
    }
  };

  const handleAddCustomTool = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customTool.trim();
    if (!trimmed) return;
    if (!tools.includes(trimmed)) {
      setTools([...tools, trimmed]);
    }
    setCustomTool("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; instructions?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Agent name is required";
    }
    if (!instructions.trim()) {
      newErrors.instructions = "Instructions are required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        instructions: instructions.trim(),
        knowledgeBase: knowledgeBase.trim(),
        tools,
        isActive,
      });
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Card */}
      <div
        className="w-full max-w-xl bg-[#180d34] border border-purple-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-white overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {initialData ? "Edit Agent" : "Create New Agent"}
              </h2>
              <p className="text-xs text-purple-200/70">
                {initialData
                  ? "Update agent configuration, instructions, or tools"
                  : "Configure your autonomous AI agent"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Agent Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Agent Name</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Inbox Assistant, Calendar Scheduler"
              className={`w-full bg-black/30 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                errors.name
                  ? "border-red-400 focus:border-red-500"
                  : "border-white/10 focus:border-purple-400"
              }`}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Instructions / System Prompt</span>
              <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => {
                setInstructions(e.target.value);
                if (errors.instructions)
                  setErrors((prev) => ({ ...prev, instructions: undefined }));
              }}
              placeholder="Define what this agent does, its personality, constraints, and how it handles user tasks..."
              className={`w-full bg-black/30 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-colors resize-none font-mono ${
                errors.instructions
                  ? "border-red-400 focus:border-red-500"
                  : "border-white/10 focus:border-purple-400"
              }`}
            />
            {errors.instructions && (
              <p className="text-xs text-red-400">{errors.instructions}</p>
            )}
          </div>

          {/* Knowledge Base */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-300" />
              <span>Knowledge Base (Optional)</span>
            </label>
            <input
              type="text"
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              placeholder="e.g. Document URLs, company handbook, or FAQs context"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          {/* Selectable Tools */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-purple-300" />
              <span>Integrated Tools</span>
            </label>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {PRESET_TOOLS.map((tool) => {
                const selected = tools.includes(tool);
                return (
                  <button
                    type="button"
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      selected
                        ? "bg-purple-600/30 border-purple-400/60 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-purple-300" />}
                    <span>{tool}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Tool Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customTool}
                onChange={(e) => setCustomTool(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTool();
                  }
                }}
                placeholder="Or add custom tool..."
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddCustomTool()}
                className="h-8 bg-white/5 hover:bg-white/10 text-white border-white/15 text-xs gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
            </div>

            {/* Non-preset custom tools selected */}
            {tools.filter((t) => !PRESET_TOOLS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tools
                  .filter((t) => !PRESET_TOOLS.includes(t))
                  .map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/30 text-xs text-purple-200"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => toggleTool(t)}
                        className="hover:text-red-400 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Active Status Switch */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <div>
              <div className="text-sm font-semibold text-white">Agent Status</div>
              <div className="text-xs text-white/50">
                {isActive ? "Agent will be active and ready to execute" : "Agent will be paused"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer border ${
                isActive ? "bg-purple-600 border-purple-400" : "bg-white/10 border-white/20"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  isActive ? "translate-x-6.5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs sm:text-sm cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? "Save Changes" : "Create Agent"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AgentModal;

