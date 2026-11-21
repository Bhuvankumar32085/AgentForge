import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import { userApi } from "../../axios/userApi";
import { toast } from "sonner";
import { Bot, Mail, User, ShieldCheck, CheckCircle2 } from "lucide-react";

interface AdminInfo {
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
}

export function Footer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);

  // Fetch Admin contact details from backend API (GET /api/users/admin)
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await userApi.get("/admin");
        if (res.data?.success && res.data?.data) {
          setAdminInfo(res.data.data);
        }
      } catch {
        // Fallback UI handles unassigned admin gracefully
      }
    };

    fetchAdmin();
  }, []);

  return (
    <footer className="bg-[#0e061e] text-white/70 pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/10 text-left">
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Agent<span className="text-purple-400">Forge</span>
            </span>
          </div>
          <p className="text-xs text-purple-200/60 leading-relaxed max-w-xs">
            The autonomous personal AI workforce platform. Create, connect, and
            automate real-world tasks with ease.
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
            Platform
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-purple-300 transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate("/integrations");
                  } else {
                    navigate("/login");
                  }
                }}
                className="hover:text-purple-300 transition-colors"
              >
                Integrations
              </button>
            </li>
            <li>
              <a href="#features" className="hover:text-purple-300 transition-colors">
                Features
              </a>
            </li>
            <li>
              <span
                className="hover:text-purple-300 transition-colors cursor-pointer"
                onClick={() => toast.info("Pricing details coming soon!")}
              >
                Pricing
              </span>
            </li>
          </ul>
        </div>

        {/* Column 3: Apps & Connectors */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
            Integrations
          </h4>
          <ul className="space-y-2 text-xs text-purple-200/60">
            <li>Gmail Agent</li>
            <li>Google Calendar</li>
            <li>Instagram Automation</li>
            <li>Custom Webhooks</li>
          </ul>
        </div>

        {/* Column 4: Dynamic Admin Contact Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Contact & Support
          </h4>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
            {adminInfo ? (
              <>
                <p className="text-white font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  {adminInfo.name}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <a
                    href={`mailto:${adminInfo.email}`}
                    className="text-purple-300 hover:underline"
                  >
                    {adminInfo.email}
                  </a>
                </p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-semibold mt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Verified Admin
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <p className="text-white/80 font-medium">Admin / Support Team</p>
                <p className="text-purple-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  support@agentforge.ai
                </p>
                <p className="text-[10px] text-purple-200/50 mt-1">
                  (Admin contact info dynamically displays here once assigned in DB)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-200/50 gap-4">
        <p>© 2026 AgentForge. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-purple-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-purple-300 cursor-pointer">Terms of Service</span>
          <span className="hover:text-purple-300 cursor-pointer">Security</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

