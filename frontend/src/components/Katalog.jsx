import { Link } from "react-router";
import Navbar from "@/components/Navbar";

export default function Katalog() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />

			<main className="mx-auto max-w-5xl px-4 py-16">
				<h1 className="text-2xl font-semibold text-gray-900">Katalog kursów</h1>
				<p className="mt-4 text-gray-600">Lista kursów będzie dostępna wkrótce.</p>
			</main>
		</div>
	);
}
