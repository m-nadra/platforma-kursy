import { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { login as loginRequest } from "@/auth/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [accessToken, setAccessToken] = useState(null);
	const navigate = useNavigate();

	const handleLogin = useCallback(
		async ({ login, password }) => {
			const { data, error } = await loginRequest(login, password);

			if (error) return error;

			const isAdmin = Boolean(data.is_admin);

			setAccessToken(data.accessToken);
			setUser({
				isAdmin,
				role: isAdmin ? "admin" : "user",
			});
			navigate(isAdmin ? "/admin" : "/moje-kursy", { replace: true });

			return null;
		},
		[navigate]
	);

	const logout = useCallback(() => {
		setUser(null);
		setAccessToken(null);
	}, []);

	return (
		<AuthContext.Provider value={{ user, accessToken, handleLogin, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
