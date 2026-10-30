import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "@/auth/AuthContext";
import AuthLayout from "@/components/AuthLayout";
import Login from "@/components/Login";
import Register from "@/components/Register";
import Main from "@/components/Main";
import Katalog from "@/components/Katalog";
import MojeKursy from "@/components/MojeKursy";
import Admin from "@/components/Admin";
import Profile from "@/components/Profile";
import RequireAuth from "@/routes/RequireAuth";

function Root() {
	return (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	);
}

const router = createBrowserRouter([
	{
		element: <Root />,
		children: [
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
					{ path: "/moje-kursy", element: <MojeKursy /> },
					{ path: "/profil", element: <Profile /> },
				],
			},
			{
				element: <RequireAuth role="admin" />,
				children: [
					{ path: "/admin", element: <Admin /> },
				],
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
	<RouterProvider router={router} />
);
