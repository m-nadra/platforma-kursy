import { useActionState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/auth/AuthContext";

export default function Signup() {
	const { handleRegister } = useAuth();

	const [errors, formAction, isPending] = useActionState(async (_, formData) => {
		const username = formData.get("username");
		const email = formData.get("email");
		const password = formData.get("password");
		const password2 = formData.get("repeated_password");
		const formErrors = {};

		if (!username) formErrors.username = "Podaj nazwę użytkownika";
		if (!email) formErrors.email = "Podaj adres e-mail";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			formErrors.email = "Podaj poprawny adres e-mail";
		if (!password) formErrors.password = "Podaj hasło";
		if (!password2) formErrors.repeated_password = "Podaj hasło";
		if (password !== password2) formErrors.repeated_password = "Hasła nie są takie same";

		if (Object.keys(formErrors).length === 0)
			formErrors.serverResponse = await handleRegister({
				username,
				email,
				password,
			});
		return formErrors;
	}, {});

	return (
		<div>
			<h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
				Zarejestruj się
			</h1>

			{errors.serverResponse && (
				<p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
					{errors.serverResponse}
				</p>
			)}

			<form action={formAction} className="flex flex-col gap-4">
				<div>
					<label
						htmlFor="username"
						className="mb-1 block text-sm font-medium text-gray-700"
					>
						Nazwa użytkownika
					</label>
					<input
						type="text"
						name="username"
						className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
					{errors.username && (
						<p className="mt-1 text-sm text-red-600">{errors.username}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="email"
						className="mb-1 block text-sm font-medium text-gray-700"
					>
						Adres e-mail
					</label>
					<input
						type="text"
						name="email"
						className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
					{errors.email && (
						<p className="mt-1 text-sm text-red-600">{errors.email}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="password"
						className="mb-1 block text-sm font-medium text-gray-700"
					>
						Hasło
					</label>
					<input
						type="password"
						name="password"
						className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
					{errors.password && (
						<p className="mt-1 text-sm text-red-600">{errors.password}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="repeated_password"
						className="mb-1 block text-sm font-medium text-gray-700"
					>
						Powtórz hasło
					</label>
					<input
						type="password"
						name="repeated_password"
						className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
					{errors.repeated_password && (
						<p className="mt-1 text-sm text-red-600">{errors.repeated_password}</p>
					)}
				</div>

				<input
					type="submit"
					value={isPending ? "Tworzenie konta..." : "Załóż konto"}
					disabled={isPending}
					className="mt-2 cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
				/>
			</form>

			<p className="mt-6 text-center text-sm text-gray-600">
				Masz już konto?{" "}
				<Link to="/logowanie" className="font-medium text-blue-600 hover:underline">
					Zaloguj się
				</Link>
			</p>
		</div>
	);
}
