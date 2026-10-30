import { Link } from "react-router";
import { useAuth } from "@/auth/AuthContext";

export default function Navbar() {
	const { user, logout } = useAuth();

	return (
		<header className="border-b border-gray-200">
			<nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
				<Link to="/" className="text-lg font-semibold text-gray-900">
					Kursy online
				</Link>

				<div className="flex flex-wrap items-center gap-4">
					<Link
						to="/katalog"
						className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
					>
						Katalog kursów
					</Link>

					{user && (
						<>
							<Link
								to={user.isAdmin ? "/admin" : "/moje-kursy"}
								className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
							>
								{user.isAdmin ? "Panel administratora" : "Moje kursy"}
							</Link>
							<Link
								to="/profil"
								className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
							>
								Profil
							</Link>
							<button
								type="button"
								onClick={logout}
								className="cursor-pointer text-sm font-medium text-gray-600 transition-colors hover:text-red-600"
							>
								Wyloguj
							</button>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}
