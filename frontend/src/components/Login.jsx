import { useActionState } from "react";
import { Link } from "react-router";

export default function Login() {
	const [errors, formAction] = useActionState(async (_, formData) => {
		const login = formData.get("login");
		const password = formData.get("password");
		const formErrors = {};

		if (!login) formErrors.login = "Podaj nazwę użytkownika lub adres e-mail";
		if (!password) formErrors.password = "Podaj hasło";

		if (Object.keys(formErrors).length === 0)
			console.log("Login")
		return formErrors;
	}, {});

	return (
		<div>
			<h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
				Zaloguj się
			</h1>

			{errors.serverResponse && (
				<p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
					{errors.serverResponse}
				</p>
			)}

			<form action={formAction} className="flex flex-col gap-4">
				<div>
					<label
						htmlFor="login"
						className="mb-1 block text-sm font-medium text-gray-700"
					>
						Nazwa użytkownika lub adres e-mail
					</label>
					<input
						type="text"
						name="login"
						className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
					{errors.login && (
						<p className="mt-1 text-sm text-red-600">{errors.login}</p>
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

				<input
					type="submit"
					value="Zaloguj się"
					className="mt-2 cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
				/>
			</form>

			<p className="mt-6 text-center text-sm text-gray-600">
				Nie masz konta?{" "}
				<Link to="/rejestracja" className="font-medium text-blue-600 hover:underline">
					Zarejestruj się
				</Link>
			</p>
		</div>
	);
}
