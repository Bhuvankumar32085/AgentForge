import { Button } from "../ui/button";
import { Plus, Bot, Zap, PowerOff } from "lucide-react";

interface AgentStatsProps {
  userName?: string;
  total: number;
  active: number;
  onCreateClick: () => void;
}

export function AgentStats({ userName, total, active, onCreateClick }: AgentStatsProps) {
  const inactive = total - active;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Main CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-purple-900/40 via-[#1e0d3d]/60 to-[#12072b]/60 border border-purple-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-lg relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 fill-purple-300" />
            Agent Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Back, {userName || "Creator"} 👋
          </h1>
          <p className="text-sm text-purple-200/70 max-w-xl">
            Build and manage autonomous agents to automate your everyday workflows across apps and tools.
          </p>
        </div>

        <div className="relative z-10 sm:self-center">
          <Button
            onClick={onCreateClick}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Agents */}
        <div className="bg-[#180d34]/70 border border-white/10 rounded-xl p-4 flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-xs text-purple-200/60 font-medium">Total Agents</div>
          </div>
        </div>

        {/* Active Agents */}
        <div className="bg-[#180d34]/70 border border-white/10 rounded-xl p-4 flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{active}</div>
            <div className="text-xs text-emerald-300/80 font-medium">Active & Running</div>
          </div>
        </div>

        {/* Inactive Agents */}
        <div className="bg-[#180d34]/70 border border-white/10 rounded-xl p-4 flex items-center gap-4 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-xl bg-gray-500/15 border border-gray-400/30 flex items-center justify-center text-gray-400">
            <PowerOff className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{inactive}</div>
            <div className="text-xs text-gray-300/70 font-medium">Paused / Inactive</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentStats;

