import { createBrowserRouter, RouterProvider } from "react-router";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "@/auth/AuthContext";
import AuthLayout from "@/components/AuthLayout";
import Login from "@/components/Login";
import Register from "@/components/Register";
import Main from "@/components/Main";
import Katalog from "@/components/Katalog";
import RequireAuth from "@/routes/RequireAuth";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Main />,
	},
	{
		path: "/katalog",
		element: <Katalog />,
	},
	{
		element: <AuthLayout />,
		children: [
			{ path: "/logowanie", element: <Login /> },
			{ path: "/rejestracja", element: <Register /> },
		],
	},
	{
		element: <RequireAuth />,
		children: [
			// trasy tylko dla zalogowanych użytkowników
		],
	},
	{
		element: <RequireAuth role="admin" />,
		children: [
			// trasy tylko dla adminów
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
	<AuthProvider>
		<RouterProvider router={router} />
	</AuthProvider>
);
