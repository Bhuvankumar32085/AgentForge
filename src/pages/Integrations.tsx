import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Bot, LogOut, ArrowLeft, Layers, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { clearAuthUser } from "../store/userSlice";
import { userApi } from "../axios/userApi";
import { toast } from "sonner";

export function Integrations() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loggedUser } = useAppSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await userApi.post("/logout");
    } catch {
      // ignore
    }
    dispatch(clearAuthUser());
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex flex-col">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-gray-200/80 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-1.5 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Button>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 flex items-center justify-center text-purple-600">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Agent<span className="text-purple-600">Forge</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:inline">
            Logged in as <strong className="text-gray-700">{loggedUser?.name || loggedUser?.email}</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-gray-700 hover:text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center">
        <Card className="border border-gray-200/80 shadow-md bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-[linear-gradient(135deg,#12072b_0%,#260f54_100%)] text-white p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Protected Page
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              Integrations
            </CardTitle>
            <CardDescription className="text-purple-200/80 text-sm mt-1">
              Connect your favorite apps (Gmail, Google Calendar, Instagram, and more) to your AI Agents.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 space-y-6 text-center">
            <div className="py-10 flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 shadow-sm">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Integrations</h3>
              <p className="text-sm text-gray-500 max-w-md">
                This page is only accessible by authenticated users. App integration workflows and agent connectors will be configured here.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Integrations;

