import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/auth/AuthContext";

export default function RequireAuth({ role }) {
	const { user } = useAuth();
	const location = useLocation();

	if (!user)
		return <Navigate to="/logowanie" state={{ from: location }} replace />;

	if (role && user.role !== role) return <Navigate to="/" replace />;

	return <Outlet />;
}
