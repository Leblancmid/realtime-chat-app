import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // prevent redirect loop
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />; // ✅ REQUIRED for grouped routes
}