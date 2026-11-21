import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearAuthUser } from "../../store/userSlice";
import { userApi } from "../../axios/userApi";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { Bot, User, LogOut, Menu, X, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loggedUser, isAuthenticated } = useAppSelector((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await userApi.post("/logout");
    } catch {
      // ignore network errors
    }
    dispatch(clearAuthUser());
    toast.info("Logged out successfully");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#12072b]/85 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Left: Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.35)] backdrop-blur-md group-hover:scale-105 transition-transform">
            <Bot className="w-6 h-6 text-purple-300" />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Agent<span className="text-purple-400">Forge</span>
          </span>
        </div>

        {/* Center: Navigation Links Pill Container */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md shadow-xs">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-1.5 rounded-full text-white text-sm font-semibold bg-white/10 shadow-xs cursor-pointer"
          >
            Home
          </button>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3.5 py-1.5 rounded-full text-purple-300 hover:text-white text-sm font-semibold flex items-center gap-1.5 bg-purple-500/15 border border-purple-400/30 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
          )}
          <a
            href="#features"
            className="px-3.5 py-1.5 rounded-full text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            Features
          </a>
          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate("/integrations");
              } else {
                toast.info("Please sign in to access Integrations");
                navigate("/login");
              }
            }}
            className="px-3.5 py-1.5 rounded-full text-white/70 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Integrations
          </button>
          <span
            onClick={() => toast.info("Pricing details coming soon!")}
            className="px-3.5 py-1.5 rounded-full text-white/40 hover:text-white/60 text-sm font-medium cursor-pointer transition-colors"
          >
            Pricing
          </span>
          <span
            onClick={() => toast.info("Documentation coming soon!")}
            className="px-3.5 py-1.5 rounded-full text-white/40 hover:text-white/60 text-sm font-medium cursor-pointer transition-colors"
          >
            Docs
          </span>
        </div>

        {/* Right: User Auth Action */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && loggedUser ? (
            <div className="flex items-center gap-2.5">
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.35)] cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Go to Dashboard
              </Button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold hover:bg-purple-500/30 transition-colors cursor-pointer"
              >
                {loggedUser.profilePicture ? (
                  <img
                    src={loggedUser.profilePicture}
                    alt={loggedUser.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-purple-300" />
                )}
                <span className="max-w-[100px] truncate">{loggedUser.name}</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/70 hover:text-white hover:bg-white/10 gap-1 text-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="rounded-full bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs sm:text-sm px-4 py-2 gap-2 shadow-sm border-gray-200 cursor-pointer"
            >
              <FcGoogle className="w-4 h-4 shrink-0" />
              Sign in with Google
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 rounded-lg hover:bg-white/10 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#12072b] border-b border-white/10 px-6 py-4 space-y-3">
          <button
            onClick={() => {
              navigate("/");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left text-sm font-semibold text-white py-1.5"
          >
            Home
          </button>
          {isAuthenticated && (
            <button
              onClick={() => {
                navigate("/dashboard");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-sm font-semibold text-purple-300 py-1.5"
            >
              Go to Dashboard
            </button>
          )}
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/70 py-1.5"
          >
            Features
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (isAuthenticated) {
                navigate("/integrations");
              } else {
                toast.info("Please sign in to access Integrations");
                navigate("/login");
              }
            }}
            className="block w-full text-left text-sm font-medium text-white/70 py-1.5"
          >
            Integrations (Protected)
          </button>

          <div className="pt-3 border-t border-white/10">
            {isAuthenticated && loggedUser ? (
              <div className="space-y-2">
                <div className="text-xs text-purple-300 font-medium">
                  Signed in as {loggedUser.name}
                </div>
                <Button
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs py-2 gap-2"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full text-xs text-red-400 border-red-500/30"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs py-2 gap-2"
              >
                <FcGoogle className="w-4 h-4" />
                Sign in with Google
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

