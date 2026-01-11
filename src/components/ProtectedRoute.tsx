import { Navigate, Outlet } from "react-router-dom";
import { getAuthData } from "@/lib/auth";

interface ProtectedRouteProps {
  allowedRole: "admin" | "employee";
}

export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const auth = getAuthData();

  console.log(auth?.role);

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (auth.role.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to={auth.role === "admin" ? "/admin" : "/employee"} replace />;
  }

  return <Outlet />;
};