import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider } from "../../firebase";
import { userApi } from "../../axios/userApi";
import { useAppDispatch } from "../../store";
import { setAuthUser } from "../../store/userSlice";
import { Button } from "../../components/ui/button";
import {
    Zap,
    Layers,
    CalendarDays,
    BarChart3,
    Check,
    Loader2,
    AlertCircle,
} from "lucide-react";
import robotIllustration from "../../assets/ai_robot_blended.png";

// AgentForge Custom Robot Icon (matching design in image)
export function AgentForgeIcon({
    className = "w-6 h-6",
    color = "currentColor",
}: {
    className?: string;
    color?: string;
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Top Antenna */}
            <circle cx="20" cy="5.5" r="2.5" fill={color} />
            <path
                d="M20 8V11.5"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            {/* Side Headphones/Ears */}
            <rect x="3" y="16.5" width="3.5" height="10" rx="1.75" fill={color} />
            <rect x="33.5" y="16.5" width="3.5" height="10" rx="1.75" fill={color} />
            {/* Head Outer Frame */}
            <rect
                x="7"
                y="11.5"
                width="26"
                height="20.5"
                rx="7"
                stroke={color}
                strokeWidth="2.8"
            />
            {/* Eyes */}
            <circle cx="15" cy="20" r="2.2" fill={color} />
            <circle cx="25" cy="20" r="2.2" fill={color} />
            {/* Mouth */}
            <rect x="15" y="25.5" width="10" height="2.2" rx="1.1" fill={color} />
        </svg>
    );
}

export function Login() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            // 1. Firebase Google Sign-In Popup
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            // 2. Authenticate with backend using userApi axios instance
            const res = await userApi.post("/login", { token: idToken });
            console.log("Login successful:", res);
            console.log("User data:", res.data);

            // 3. Save to Redux userSlice
            if (res.data?.data?.user) {
                dispatch(setAuthUser(res.data.data.user));
            }

            // 4. Show Toast Notification
            toast.success(res.data?.message || "Login Successful!");

            // 5. Redirect to home page (/)
            navigate("/");
        } catch (error: any) {
            console.error("Google Login Error:", error);
            if (error?.code === "auth/popup-closed-by-user") {
                toast.warning("Sign-in popup was cancelled.");
                setErrorMessage("Sign-in cancelled. Please try again.");
            } else {
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to sign in. Please try again.";
                toast.error(message);
                setErrorMessage(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f0f2f8] flex items-center justify-center p-3 sm:p-6 lg:p-8 select-none">
            {/* Main Card Container */}
            <div className="w-full max-w-[1000px] rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-[0_20px_60px_-15px_rgba(25,12,50,0.22)] border border-gray-100/80 grid grid-cols-1 lg:grid-cols-[1.28fr_1fr] relative">

                {/* ================= MOBILE-ONLY COMPACT TOP HERO BANNER ================= */}
                <div className="lg:hidden relative overflow-hidden bg-[linear-gradient(142deg,#12072b_0%,#190a38_42%,#260f54_100%)] px-5 py-5 text-white flex items-center justify-between">
                    {/* Subtle Ambient Glows */}
                    <div className="absolute top-0 right-0 w-44 h-44 bg-purple-600/30 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-700/25 rounded-full blur-2xl pointer-events-none" />

                    {/* Left: Brand + Punchy Headline */}
                    <div className="relative z-10 space-y-1.5 max-w-[210px] sm:max-w-[260px]">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.35)] backdrop-blur-md">
                                <AgentForgeIcon className="w-4 h-4" color="#d8b4fe" />
                            </div>
                            <span className="text-base font-bold tracking-tight text-white">
                                AgentForge
                            </span>
                        </div>
                        <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                            Build & Run Your{" "}
                            <span className="text-[#c084fc]">AI Agents</span>
                        </h1>
                        <p className="text-[11px] sm:text-xs text-purple-200/70 leading-tight">
                            Automate tasks with custom AI workforce.
                        </p>
                    </div>

                    {/* Right: Cute Robot Illustration in Header */}
                    <div className="relative z-10 w-24 sm:w-28 shrink-0 -mr-2 -my-2 flex items-center justify-center pointer-events-none">
                        <img
                            src={robotIllustration}
                            alt="AgentForge AI Robot"
                            className="w-full h-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                        />
                    </div>
                </div>

                {/* ================= DESKTOP FULL HERO PANEL (HIDDEN ON MOBILE) ================= */}
                <div className="hidden lg:flex relative overflow-hidden bg-[linear-gradient(142deg,#12072b_0%,#190a38_42%,#260f54_100%)] p-9 lg:p-11 text-white flex-col justify-between min-h-[600px]">

                    {/* Ambient Lighting Behind Artwork */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-700/25 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Brand Logo */}
                    <div className="relative z-10 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)] backdrop-blur-md">
                            <AgentForgeIcon className="w-5 h-5" color="#d8b4fe" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            AgentForge
                        </span>
                    </div>

                    {/* Headline & Description */}
                    <div className="relative z-10 mt-6 lg:mt-7 space-y-3 max-w-md">
                        <h1 className="text-2xl sm:text-3xl lg:text-[37px] font-extrabold tracking-tight leading-[1.22]">
                            Build, Automate, and <br />
                            Run Your{" "}
                            <span className="text-[#c084fc] drop-shadow-[0_2px_12px_rgba(192,132,252,0.35)]">
                                AI Agents
                            </span>
                        </h1>
                        <p className="text-purple-200/70 text-xs sm:text-[13.5px] lg:text-[14px] leading-relaxed max-w-sm">
                            Create your own AI agents, connect your favorite apps, and automate
                            real-world tasks — all in one place.
                        </p>
                    </div>

                    {/* Features Bullet List */}
                    <div className="relative z-10 mt-6 sm:mt-8 space-y-3.5 max-w-[290px] sm:max-w-[310px]">
                        {/* Item 1 */}
                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-purple-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-xs group-hover:scale-105 transition-transform shrink-0">
                                <Zap className="w-3.5 h-3.5 fill-purple-300 text-purple-300" />
                            </div>
                            <span className="text-xs sm:text-[13px] font-medium text-white/95">
                                Build Custom AI Agents
                            </span>
                        </div>

                        {/* Item 2 */}
                        <div className="flex items-start gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-purple-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-xs group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                                <Layers className="w-3.5 h-3.5 text-purple-300" />
                            </div>
                            <div>
                                <div className="text-xs sm:text-[13px] font-medium text-white/95 leading-tight">
                                    Integrate Your Apps
                                </div>
                                <div className="text-[11px] text-purple-200/65 font-normal mt-0.5">
                                    (Gmail, Calendar, Instagram, etc.)
                                </div>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-purple-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-xs group-hover:scale-105 transition-transform shrink-0">
                                <CalendarDays className="w-3.5 h-3.5 text-purple-300" />
                            </div>
                            <span className="text-xs sm:text-[13px] font-medium text-white/95">
                                Schedule & Automate Tasks
                            </span>
                        </div>

                        {/* Item 4 */}
                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-purple-200 shadow-[0_2px_8px_rgba(0,0,0,0.12)] backdrop-blur-xs group-hover:scale-105 transition-transform shrink-0">
                                <BarChart3 className="w-3.5 h-3.5 text-purple-300" />
                            </div>
                            <span className="text-xs sm:text-[13px] font-medium text-white/95">
                                Track Activity & Execution History
                            </span>
                        </div>
                    </div>

                    {/* 3D Robot Illustration (Anchored to Bottom-Right Corner) */}
                    <div className="absolute -bottom-1 -right-1 w-[260px] lg:w-[275px] pointer-events-none select-none z-10">
                        <img
                            src={robotIllustration}
                            alt="AgentForge AI Robot"
                            className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                        />
                    </div>

                    {/* Bottom Wave Glow Accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.35),transparent_70%)]" />
                </div>

                {/* ================= SIGN-IN PANEL (CLEAN & ACCESSIBLE ON BOTH MOBILE & DESKTOP) ================= */}
                <div className="relative bg-white flex flex-col justify-center px-6 sm:px-11 lg:px-14 py-8 sm:py-10 lg:py-14 overflow-hidden">

                    {/* Bottom Right Pastel Ambient Waves */}
                    <svg
                        className="absolute -bottom-2 -right-2 w-44 sm:w-48 h-44 sm:h-48 pointer-events-none text-purple-100/80"
                        viewBox="0 0 200 200"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M60 200 C 120 190, 160 150, 180 90 C 190 60, 195 20, 200 0 L 200 200 Z" />
                    </svg>
                    <svg
                        className="absolute -bottom-8 -right-8 w-36 sm:w-40 h-36 sm:h-40 pointer-events-none text-purple-200/50"
                        viewBox="0 0 200 200"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M80 200 C 135 190, 170 160, 190 110 C 198 80, 200 40, 200 0 L 200 200 Z" />
                    </svg>

                    <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center">

                        {/* Desktop Brand Badge (Hidden on mobile since top banner already has it) */}
                        <div className="hidden lg:flex flex-col items-center justify-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#f5f3ff] border border-purple-200/70 flex items-center justify-center text-purple-600 mb-2.5 shadow-[0_4px_14px_rgba(147,51,234,0.12)]">
                                <AgentForgeIcon className="w-6 h-6" color="#7c3aed" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-gray-900">
                                Agent<span className="text-purple-600">Forge</span>
                            </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="text-center mb-6 sm:mb-7 space-y-1">
                            <h2 className="text-2xl sm:text-[27px] font-extrabold text-[#111827] tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-xs sm:text-[13.5px] text-gray-500 font-normal">
                                Sign in to access your AI workforce
                            </p>
                        </div>

                        {/* Error Message Alert */}
                        {errorMessage && (
                            <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-600 animate-in fade-in duration-200">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                                <span className="flex-1 leading-relaxed">{errorMessage}</span>
                            </div>
                        )}

                        {/* Continue with Google Button */}
                        <Button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/90 text-gray-800 font-semibold text-sm sm:text-[14.5px] shadow-[0_2px_6px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <FcGoogle className="w-5 h-5 shrink-0" />
                                    <span className="tracking-tight text-gray-800">
                                        Continue with Google
                                    </span>
                                </>
                            )}
                        </Button>

                        {/* Divider "or" */}
                        <div className="w-full relative my-6 sm:my-7 flex items-center justify-center">
                            <div className="w-full border-t border-gray-200/80" />
                            <span className="absolute bg-white px-3 text-xs text-gray-400 font-medium lowercase">
                                or
                            </span>
                        </div>

                        {/* Trust Badges / Checkpoints */}
                        <div className="w-full space-y-3 sm:space-y-3.5">
                            {[
                                "Secure & One-Click Login",
                                "Your Agents, Automations & History in One Place",
                                "No Password Needed",
                            ].map((text, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                    <span className="text-xs sm:text-[13px] text-gray-600 font-medium">
                                        {text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Mobile-Only Feature Highlights Pill Footer */}
                        <div className="lg:hidden w-full mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                            <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-purple-500" /> AI Agents
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3 text-purple-500" /> App Connect
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3 text-purple-500" /> Automation
                            </span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;
