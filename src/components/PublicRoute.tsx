import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store";
import { Loader2 } from "lucide-react";

export function PublicRoute() {
  const { isAuthenticated, loading } = useAppSelector((state) => state.user);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export default PublicRoute;

