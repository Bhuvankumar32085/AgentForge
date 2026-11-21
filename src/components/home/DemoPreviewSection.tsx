import { Bot, Bell } from "lucide-react";

export function DemoPreviewSection() {
  return (
    <section id="demo-preview" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f8f9fe] border-t border-gray-100">
      <div className="max-w-6xl mx-auto space-y-12 text-center">
        {/* Header */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            See <span className="text-purple-600">AgentForge</span> in Action
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Build an agent, connect your apps, schedule tasks, and let it work for you.
          </p>
        </div>

        {/* Product UI Mockup Window (Matching Image) */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/80 shadow-[0_20px_50px_rgba(20,10,40,0.1)] bg-white text-left">
          {/* Top Mockup Bar */}
          <div className="bg-[linear-gradient(135deg,#12072b_0%,#260f54_100%)] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">AgentForge</span>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-purple-200/70" />
              <div className="w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                B
              </div>
            </div>
          </div>

          {/* Mockup Workspace Content */}
          <div className="p-6 sm:p-10 space-y-6">
            <div className="border-b border-gray-100 pb-5">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Welcome Back 👋
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Manage your AI agents, automations, and integrations.
              </p>
            </div>

            {/* Mockup Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-xs text-gray-500 font-medium">Active Agents</span>
                <p className="text-2xl font-bold text-purple-700 mt-1">3</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-xs text-gray-500 font-medium">Connected Apps</span>
                <p className="text-2xl font-bold text-indigo-700 mt-1">Gmail, Calendar</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-xs text-gray-500 font-medium">Automations Executed</span>
                <p className="text-2xl font-bold text-emerald-700 mt-1">128</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DemoPreviewSection;

