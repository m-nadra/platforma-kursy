import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
	login as loginRequest,
	logout as logoutRequest,
	refresh as refreshRequest,
} from "@/auth/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [accessToken, setAccessToken] = useState(null);
	const [ready, setReady] = useState(false);
	const navigate = useNavigate();

	const applySession = useCallback((data) => {
		const isAdmin = Boolean(data.is_admin);

		setAccessToken(data.accessToken);
		setUser({
			isAdmin,
			role: isAdmin ? "admin" : "user",
		});
	}, []);

	useEffect(() => {
		let active = true;

		(async () => {
			const { data } = await refreshRequest();

			if (!active) return;

			if (data) applySession(data);

			setReady(true);
		})();

		return () => {
			active = false;
		};
	}, [applySession]);

	const handleLogin = useCallback(
		async ({ login, password }) => {
			const { data, error } = await loginRequest(login, password);

			if (error) return error;

			applySession(data);
			navigate(data.is_admin ? "/admin" : "/moje-kursy", { replace: true });

			return null;
		},
		[applySession, navigate]
	);

	const refreshSession = useCallback(async () => {
		const { data } = await refreshRequest();

		if (!data) return false;

		applySession(data);
		return true;
	}, [applySession]);

	const logout = useCallback(async () => {
		await logoutRequest();
		setUser(null);
		setAccessToken(null);
		navigate("/logowanie", { replace: true });
	}, [navigate]);

	return (
		<AuthContext.Provider
			value={{
				user,
				accessToken,
				ready,
				handleLogin,
				refreshSession,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
