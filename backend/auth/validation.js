const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const USERNAME_MAX = 30;
const EMAIL_MAX = 45;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 255;

const OPTIONAL_FIELDS = [
	["imie", 28, "Imię"],
	["nazwisko", 57, "Nazwisko"],
	["kraj", 50, "Kraj"],
	["wyksztalcenie", 16, "Wykształcenie"]
];


export function validateUsername(value) {
	if (typeof value !== "string" || !value.trim()) {
		return "Podaj nazwę użytkownika";
	}
	if (value.trim().length > USERNAME_MAX) {
		return `Nazwa użytkownika może mieć maksymalnie ${USERNAME_MAX} znaków`;
	}
	if (value.includes("@")) {
		return "Nazwa użytkownika nie może zawierać znaku @";
	}
	return null;
}

export function validateEmail(value) {
	if (typeof value !== "string" || !EMAIL_RE.test(value.trim())) {
		return "Podaj poprawny adres e-mail";
	}
	if (value.trim().length > EMAIL_MAX) {
		return `Adres e-mail może mieć maksymalnie ${EMAIL_MAX} znaków`;
	}
	return null;
}

export function validateNewPassword(value) {
	if (typeof value !== "string" || value.length < PASSWORD_MIN) {
		return `Hasło musi mieć co najmniej ${PASSWORD_MIN} znaków`;
	}
	if (value.length > PASSWORD_MAX) {
		return "Hasło jest zbyt długie";
	}
	return null;
}

function validateOptionalFields(input) {
	for (const [field, maxLength, label] of OPTIONAL_FIELDS) {
		const value = input[field];

		if (value !== undefined && value !== null && typeof value !== "string") {
			return `Nieprawidłowa wartość pola ${label}`;
		}
		if (typeof value === "string" && value.trim().length > maxLength) {
			return `${label} może mieć maksymalnie ${maxLength} znaków`;
		}
	}
	return null;
}

function normalizeOptional(value) {
	if (typeof value !== "string") return null;

	const trimmed = value.trim();
	return trimmed || null;
}

export function parseRegistration(body) {
	const { username, email, password } = body ?? {};

	const error =
		validateUsername(username) ?? validateEmail(email) ?? validateNewPassword(password);
	if (error) return { error };

	return {
		data: {
			nazwa: username.trim(),
			email: email.trim().toLowerCase(),
			password
		}
	};
}

export function parseProfile(body) {
	const input = body ?? {};

	const error =
		validateUsername(input.nazwa) ?? validateEmail(input.email) ?? validateOptionalFields(input);
	if (error) return { error };

	const data = {
		nazwa: input.nazwa.trim(),
		email: input.email.trim().toLowerCase()
	};
	for (const [field] of OPTIONAL_FIELDS) {
		data[field] = normalizeOptional(input[field]);
	}

	return { data };
}