import { Outlet } from "react-router";
import Navbar from "@/components/Navbar";

export default function AuthLayout() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />

			<main className="flex items-center justify-center p-4 pt-16">
				<div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
