import { Link } from "react-router";

export default function Navbar() {
	return (
		<header className="border-b border-gray-200">
			<nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
				<Link to="/" className="text-lg font-semibold text-gray-900">
					Kursy online
				</Link>
				<Link
					to="/katalog"
					className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
				>
					Katalog kursów
				</Link>
			</nav>
		</header>
	);
}
