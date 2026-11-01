const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseRegistration(body) {
	const { username, email, password } = body ?? {};

	if (typeof username !== "string" || !username.trim()) {
		return { error: "Podaj nazwę użytkownika" };
	}
	if (username.trim().length > 30) {
		return { error: "Nazwa użytkownika może mieć maksymalnie 30 znaków" };
	}
	if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
		return { error: "Podaj poprawny adres e-mail" };
	}
	if (email.trim().length > 45) {
		return { error: "Adres e-mail może mieć maksymalnie 45 znaków" };
	}
	if (typeof password !== "string" || password.length < 8) {
		return { error: "Hasło musi mieć co najmniej 8 znaków" };
	}
	if (password.length > 255) {
		return { error: "Hasło jest zbyt długie" };
	}

	return {
		data: {
			nazwa: username.trim(),
			email: email.trim().toLowerCase(),
			password
		}
	};
}