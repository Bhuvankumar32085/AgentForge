import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAppSelector } from "../../store";
import { FcGoogle } from "react-icons/fc";
import {
  Sparkles,
  Play,
  Zap,
  Calendar,
  Link2,
  History,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import robotIllustration from "../../assets/ai_robot_blended.png";

export function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.user);

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,#281057_0%,#190a38_50%,#12072b_100%)] text-white pt-32 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
      {/* Ambient Glowing Background Blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] items-center gap-12 lg:gap-8 relative z-10">
        
        {/* Left Hero Details */}
        <div className="space-y-6 text-left">
          {/* Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs sm:text-sm font-semibold shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-4 h-4 text-purple-300" />
            Personal AI Workforce Platform
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold text-white leading-[1.18] tracking-tight">
            Build, Automate, and <br />
            Run Your{" "}
            <span className="text-[#c084fc] drop-shadow-[0_2px_16px_rgba(192,132,252,0.45)]">
              AI Agents
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-purple-200/80 text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-xl">
            Create custom AI agents, connect your favorite apps (Gmail, Calendar,
            Instagram), and automate real-world tasks — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm sm:text-base shadow-[0_0_24px_rgba(168,85,247,0.45)] flex items-center gap-2.5 cursor-pointer"
              >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm sm:text-base shadow-[0_0_24px_rgba(168,85,247,0.45)] flex items-center gap-2.5 cursor-pointer"
              >
                <FcGoogle className="w-5 h-5 shrink-0 bg-white rounded-full p-0.5" />
                Get Started with Google
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("demo-preview");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-12 px-6 rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm sm:text-base backdrop-blur-xs flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              See Demo
            </Button>
          </div>
        </div>

        {/* Right Hero Artwork & Floating Feature Cards */}
        <div className="relative flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
          {/* Glowing Ring Effect */}
          <div className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full border border-purple-500/25 bg-purple-600/10 blur-xl pointer-events-none" />

          {/* Centered Robot Illustration */}
          <div className="relative z-20 w-[240px] sm:w-[300px] lg:w-[340px] pointer-events-none">
            <img
              src={robotIllustration}
              alt="AgentForge AI Robot"
              className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Floating Badge 1: Top-Left (Build AI Agents) */}
          <div className="hidden sm:flex absolute -top-2 left-0 sm:left-4 z-30 bg-[#1f0d45]/85 backdrop-blur-md border border-white/15 rounded-2xl p-3 items-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-300 fill-purple-300" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">Build AI Agents</h4>
              <p className="text-[10px] text-purple-200/70">No coding required</p>
            </div>
          </div>

          {/* Floating Badge 2: Top-Right (Schedule Tasks) */}
          <div className="hidden sm:flex absolute top-4 right-0 sm:right-2 z-30 bg-[#1f0d45]/85 backdrop-blur-md border border-white/15 rounded-2xl p-3 items-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-300" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">Schedule Tasks</h4>
              <p className="text-[10px] text-purple-200/70">One-time & recurring</p>
            </div>
          </div>

          {/* Floating Badge 3: Bottom-Left (Integrate Apps) */}
          <div className="hidden sm:flex absolute bottom-8 left-0 sm:left-2 z-30 bg-[#1f0d45]/85 backdrop-blur-md border border-white/15 rounded-2xl p-3 items-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-purple-300" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">Integrate Apps</h4>
              <p className="text-[10px] text-purple-200/70">Gmail, Calendar, Instagram</p>
            </div>
          </div>

          {/* Floating Badge 4: Bottom-Right (Track & History) */}
          <div className="hidden sm:flex absolute bottom-4 right-0 sm:right-4 z-30 bg-[#1f0d45]/85 backdrop-blur-md border border-white/15 rounded-2xl p-3 items-center gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <History className="w-4 h-4 text-purple-300" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">Track & History</h4>
              <p className="text-[10px] text-purple-200/70">See all executions</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Ambient Wave Curve */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}

export default HeroSection;

