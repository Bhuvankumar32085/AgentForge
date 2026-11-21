import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearAuthUser } from "../../store/userSlice";
import { userApi } from "../../axios/userApi";
import { toast } from "sonner";
import { Bot, ArrowLeft, LogOut, User } from "lucide-react";

export function DashboardHeader() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loggedUser } = useAppSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await userApi.post("/logout");
    } catch {
      // ignore network errors
    }
    dispatch(clearAuthUser());
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#12072b]/85 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Return Home */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs sm:text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Button>

          <div className="h-5 w-px bg-white/10" />

          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-bold text-white">
              Agent<span className="text-purple-400">Forge</span>
            </span>
          </div>
        </div>

        {/* Right: User Status & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs font-medium">
            {loggedUser?.profilePicture ? (
              <img
                src={loggedUser.profilePicture}
                alt={loggedUser.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-purple-300" />
            )}
            <span className="hidden sm:inline max-w-[120px] truncate">{loggedUser?.name || "User"}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white/70 hover:text-red-400 hover:bg-white/10 gap-1.5 text-xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;

