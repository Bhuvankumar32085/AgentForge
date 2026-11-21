import { Layers, Link2, CalendarDays, BarChart3 } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Layers,
      title: "AI Agent Builder",
      description: "Create and configure your own AI agents for any task with easy prompts.",
    },
    {
      icon: Link2,
      title: "App Integrations",
      description: "Connect Gmail, Google Calendar, Instagram, and more apps in seconds.",
    },
    {
      icon: CalendarDays,
      title: "Task Automation",
      description: "Run one-time, recurring, or event-triggered tasks seamlessly in background.",
    },
    {
      icon: BarChart3,
      title: "Execution History",
      description: "Track agent activities, view detailed real-time execution logs & output.",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
      <div className="max-w-7xl mx-auto text-center space-y-14">
        {/* Section Heading */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Everything You Need to Run Your{" "}
            <span className="text-purple-600">AI Workforce</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Powerful tools to build, connect, automate, and manage your AI agents.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-gray-200/80 bg-white hover:border-purple-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;

