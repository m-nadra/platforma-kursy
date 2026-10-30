import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/auth/AuthContext";
import {
	changePassword,
	deleteAccount,
	getProfile,
	setOtp,
	updateProfile,
} from "@/auth/profile";

const inputClass =
	"w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const emptyForm = {
	nazwa: "",
	email: "",
	imie: "",
	nazwisko: "",
	kraj: "",
	wyksztalcenie: "",
};

function toForm(profile) {
	return {
		nazwa: profile.nazwa ?? "",
		email: profile.email ?? "",
		imie: profile.imie ?? "",
		nazwisko: profile.nazwisko ?? "",
		kraj: profile.kraj ?? "",
		wyksztalcenie: profile.wyksztalcenie ?? "",
	};
}

export default function Profile() {
	const { logout } = useAuth();

	const [profile, setProfile] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);

	const [profilePending, setProfilePending] = useState(false);
	const [profileError, setProfileError] = useState(null);
	const [profileSuccess, setProfileSuccess] = useState(null);

	const [otpPending, setOtpPending] = useState(false);
	const [otpError, setOtpError] = useState(null);
	const [otpSuccess, setOtpSuccess] = useState(null);

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		repeatedPassword: "",
	});
	const [passwordPending, setPasswordPending] = useState(false);
	const [passwordError, setPasswordError] = useState(null);
	const [passwordSuccess, setPasswordSuccess] = useState(null);

	const [deletePassword, setDeletePassword] = useState("");
	const [deleteConfirmed, setDeleteConfirmed] = useState(false);
	const [deletePending, setDeletePending] = useState(false);
	const [deleteError, setDeleteError] = useState(null);

	useEffect(() => {
		let active = true;

		(async () => {
			const { data, error } = await getProfile();

			if (!active) return;

			if (error) {
				setLoadError(error);
			} else {
				setProfile(data.user);
				setForm(toForm(data.user));
			}

			setLoading(false);
		})();

		return () => {
			active = false;
		};
	}, []);

	function handleFormChange(event) {
		const { name, value } = event.target;
		setForm((current) => ({ ...current, [name]: value }));
	}

	async function handleProfileSubmit(event) {
		event.preventDefault();
		setProfileError(null);
		setProfileSuccess(null);
		setProfilePending(true);

		const { data, error } = await updateProfile(form);

		setProfilePending(false);

		if (error) {
			setProfileError(error);
			return;
		}

		setProfile(data.user);
		setForm(toForm(data.user));
		setProfileSuccess(data.message);
	}

	async function handleOtpToggle() {
		setOtpError(null);
		setOtpSuccess(null);
		setOtpPending(true);

		const { data, error } = await setOtp(!profile.czy_weryfikacja);

		setOtpPending(false);

		if (error) {
			setOtpError(error);
			return;
		}

		setProfile(data.user);
		setOtpSuccess(data.message);
	}

	function handlePasswordChange(event) {
		const { name, value } = event.target;
		setPasswordForm((current) => ({ ...current, [name]: value }));
	}

	async function handlePasswordSubmit(event) {
		event.preventDefault();
		setPasswordError(null);
		setPasswordSuccess(null);

		if (passwordForm.newPassword !== passwordForm.repeatedPassword) {
			setPasswordError("Nowe hasła nie są takie same");
			return;
		}

		setPasswordPending(true);

		const { data, error } = await changePassword(
			passwordForm.currentPassword,
			passwordForm.newPassword
		);

		setPasswordPending(false);

		if (error) {
			setPasswordError(error);
			return;
		}

		setPasswordForm({
			currentPassword: "",
			newPassword: "",
			repeatedPassword: "",
		});
		setPasswordSuccess(data.message);
	}

	async function handleDeleteSubmit(event) {
		event.preventDefault();
		setDeleteError(null);

		if (!deleteConfirmed) {
			setDeleteError("Potwierdź, że rozumiesz konsekwencje usunięcia konta");
			return;
		}

		setDeletePending(true);

		const { error } = await deleteAccount(deletePassword);

		if (error) {
			setDeletePending(false);
			setDeleteError(error);
			return;
		}

		await logout();
	}

	return (
		<div className="min-h-screen bg-white">
			<Navbar />

			<main className="mx-auto max-w-3xl px-4 py-8">
				<h1 className="text-2xl font-semibold text-gray-900">Profil</h1>

				{loading && <p className="mt-4 text-gray-600">Ładowanie profilu...</p>}

				{loadError && (
					<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
						{loadError}
					</p>
				)}

				{profile && (
					<div className="mt-6 flex flex-col gap-8">
						<section className="rounded-xl border border-gray-200 p-6">
							<h2 className="text-lg font-semibold text-gray-900">
								Dane profilu
							</h2>

							{profileError && (
								<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
									{profileError}
								</p>
							)}
							{profileSuccess && (
								<p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
									{profileSuccess}
								</p>
							)}

							<form onSubmit={handleProfileSubmit} className="mt-4 flex flex-col gap-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<label htmlFor="nazwa" className="mb-1 block text-sm font-medium text-gray-700">
											Nazwa użytkownika
										</label>
										<input
											id="nazwa"
											name="nazwa"
											value={form.nazwa}
											onChange={handleFormChange}
											className={inputClass}
										/>
									</div>

									<div>
										<label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
											Adres e-mail
										</label>
										<input
											id="email"
											name="email"
											type="email"
											value={form.email}
											onChange={handleFormChange}
											className={inputClass}
										/>
									</div>

									<div>
										<label htmlFor="imie" className="mb-1 block text-sm font-medium text-gray-700">
											Imię
										</label>
										<input
											id="imie"
											name="imie"
											value={form.imie}
											onChange={handleFormChange}
											className={inputClass}
										/>
									</div>

									<div>
										<label htmlFor="nazwisko" className="mb-1 block text-sm font-medium text-gray-700">
											Nazwisko
										</label>
										<input
											id="nazwisko"
											name="nazwisko"
											value={form.nazwisko}
											onChange={handleFormChange}
											className={inputClass}
										/>
									</div>

									<div>
										<label htmlFor="kraj" className="mb-1 block text-sm font-medium text-gray-700">
											Kraj
										</label>
										<input
											id="kraj"
											name="kraj"
											value={form.kraj}
											onChange={handleFormChange}
											className={inputClass}
										/>
									</div>

									<div>
										<label htmlFor="wyksztalcenie" className="mb-1 block text-sm font-medium text-gray-700">
											Wykształcenie
										</label>
										<input
											id="wyksztalcenie"
											name="wyksztalcenie"
											value={form.wyksztalcenie}
											onChange={handleFormChange}
											className={inputClass}
										/>
									</div>
								</div>

								<button
									type="submit"
									disabled={profilePending}
									className="self-start cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{profilePending ? "Zapisywanie..." : "Zapisz zmiany"}
								</button>
							</form>
						</section>

						<section className="rounded-xl border border-gray-200 p-6">
							<h2 className="text-lg font-semibold text-gray-900">
								Weryfikacja dwuetapowa
							</h2>
							<p className="mt-2 text-sm text-gray-600">
								Po włączeniu przy logowaniu będzie wymagany dodatkowy kod wysyłany
								na adres e-mail.
							</p>

							{otpError && (
								<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
									{otpError}
								</p>
							)}
							{otpSuccess && (
								<p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
									{otpSuccess}
								</p>
							)}

							<div className="mt-4 flex items-center justify-between gap-4">
								<span className="text-sm font-medium text-gray-700">
									Status:{" "}
									<span
										className={
											profile.czy_weryfikacja
												? "text-green-700"
												: "text-gray-500"
										}
									>
										{profile.czy_weryfikacja ? "włączona" : "wyłączona"}
									</span>
								</span>

								<button
									type="button"
									onClick={handleOtpToggle}
									disabled={otpPending}
									className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{otpPending
										? "Zmiana..."
										: profile.czy_weryfikacja
											? "Wyłącz weryfikację"
											: "Włącz weryfikację"}
								</button>
							</div>
						</section>

						<section className="rounded-xl border border-gray-200 p-6">
							<h2 className="text-lg font-semibold text-gray-900">
								Zmiana hasła
							</h2>

							{passwordError && (
								<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
									{passwordError}
								</p>
							)}
							{passwordSuccess && (
								<p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
									{passwordSuccess}
								</p>
							)}

							<form onSubmit={handlePasswordSubmit} className="mt-4 flex flex-col gap-4">
								<div>
									<label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-gray-700">
										Obecne hasło
									</label>
									<input
										id="currentPassword"
										name="currentPassword"
										type="password"
										value={passwordForm.currentPassword}
										onChange={handlePasswordChange}
										className={inputClass}
									/>
								</div>

								<div>
									<label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700">
										Nowe hasło
									</label>
									<input
										id="newPassword"
										name="newPassword"
										type="password"
										value={passwordForm.newPassword}
										onChange={handlePasswordChange}
										className={inputClass}
									/>
								</div>

								<div>
									<label htmlFor="repeatedPassword" className="mb-1 block text-sm font-medium text-gray-700">
										Powtórz nowe hasło
									</label>
									<input
										id="repeatedPassword"
										name="repeatedPassword"
										type="password"
										value={passwordForm.repeatedPassword}
										onChange={handlePasswordChange}
										className={inputClass}
									/>
								</div>

								<button
									type="submit"
									disabled={passwordPending}
									className="self-start cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{passwordPending ? "Zmiana hasła..." : "Zmień hasło"}
								</button>
							</form>
						</section>

						<section className="rounded-xl border border-red-200 bg-red-50/40 p-6">
							<h2 className="text-lg font-semibold text-red-700">
								Usunięcie konta
							</h2>
							<p className="mt-2 text-sm text-gray-600">
								Ta operacja jest nieodwracalna. Wszystkie dane powiązane z kontem
								zostaną usunięte.
							</p>

							{deleteError && (
								<p className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700">
									{deleteError}
								</p>
							)}

							<form onSubmit={handleDeleteSubmit} className="mt-4 flex flex-col gap-4">
								<div>
									<label htmlFor="deletePassword" className="mb-1 block text-sm font-medium text-gray-700">
										Hasło
									</label>
									<input
										id="deletePassword"
										type="password"
										value={deletePassword}
										onChange={(event) => setDeletePassword(event.target.value)}
										className={inputClass}
									/>
								</div>

								<label className="flex items-start gap-2 text-sm text-gray-700">
									<input
										type="checkbox"
										checked={deleteConfirmed}
										onChange={(event) => setDeleteConfirmed(event.target.checked)}
										className="mt-1"
									/>
									<span>Rozumiem, że usunięcie konta jest nieodwracalne.</span>
								</label>

								<button
									type="submit"
									disabled={deletePending}
									className="self-start cursor-pointer rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{deletePending ? "Usuwanie..." : "Usuń konto"}
								</button>
							</form>
						</section>
					</div>
				)}
			</main>
		</div>
	);
}
