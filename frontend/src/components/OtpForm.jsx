import { useActionState } from "react";
import { useAuth } from "@/auth/AuthContext";

export default function OtpForm({ otpToken, onCancel }) {
	const { handleOtp } = useAuth();

	const [errors, formAction, isPending] = useActionState(async (_, formData) => {
		const code = formData.get("code")?.trim();
		const formErrors = {};

		if (!code) formErrors.code = "Podaj kod weryfikacyjny";
		else if (!/^\d{6}$/.test(code))
			formErrors.code = "Kod powinien składać się z 6 cyfr";

		if (Object.keys(formErrors).length === 0)
			formErrors.serverResponse = await handleOtp({ otpToken, code });

		return formErrors;
	}, {});

	return (
		<div>
			<h1 className="mb-2 text-center text-2xl font-semibold text-gray-900">
				Weryfikacja dwuetapowa
			</h1>

			<p className="mb-6 text-center text-sm text-gray-600">
				Podaj 6-cyfrowy kod wysłany na Twój adres e-mail.
			</p>

			{errors.serverResponse && (
				<p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
					{errors.serverResponse}
				</p>
			)}

			<form action={formAction} className="flex flex-col gap-4">
				<div>
					<label
						htmlFor="code"
						className="mb-1 block text-sm font-medium text-gray-700"
					>
						Kod weryfikacyjny
					</label>
					<input
						type="text"
						name="code"
						inputMode="numeric"
						autoComplete="one-time-code"
						maxLength={6}
						className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-[0.5em] text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
					/>
					{errors.code && (
						<p className="mt-1 text-sm text-red-600">{errors.code}</p>
					)}
				</div>

				<input
					type="submit"
					value={isPending ? "Weryfikacja..." : "Potwierdź kod"}
					disabled={isPending}
					className="mt-2 cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
				/>
			</form>

			<button
				type="button"
				onClick={onCancel}
				className="mt-4 w-full cursor-pointer text-center text-sm font-medium text-gray-600 hover:underline"
			>
				Wróć do logowania
			</button>
		</div>
	);
}
