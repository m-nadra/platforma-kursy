import { Link } from "react-router";
import Navbar from "@/components/Navbar";

export default function Main() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />

			<main
				className="flex flex-col items-center justify-center px-4 py-32 text-center"
			>
				<h1 className="text-4xl font-semibold text-gray-900">
					Ucz się online, we własnym tempie
				</h1>
				<p className="mt-4 max-w-xl text-gray-600">
					Odkryj katalog kursów i zacznij naukę już dziś.
				</p>

				<div className="mt-8 flex gap-4">
					<Link
						to="/katalog"
						className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
					>
						Katalog kursów
					</Link>
					<Link
						to="/logowanie"
						className="rounded-md border border-gray-300 bg-white/80 px-6 py-3 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600"
					>
						Zaloguj się
					</Link>
				</div>
			</main>
		</div>
	);
}
