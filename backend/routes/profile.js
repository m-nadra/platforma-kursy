import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";
import { clearRefreshCookie } from "../auth/session.js";
import { verifyPassword } from "../auth/hashing.js";
import {
	deleteUser,
	getUserByEmail,
	getUserByName,
	getUserPasswordById,
	setUserVerification,
	updateUserPassword,
	updateUserProfile
} from "../db/users.js";
import { deleteAllSessions, deleteOtp } from "../redis/index.js";

const router = Router();

const optionalFields = [
	["imie", 28, "Imię"],
	["nazwisko", 57, "Nazwisko"],
	["kraj", 50, "Kraj"],
	["wyksztalcenie", 16, "Wykształcenie"]
];

function buildProfile(user) {
	return {
		id: user.id_uzytkownik,
		nazwa: user.nazwa,
		email: user.email,
		imie: user.imie,
		nazwisko: user.nazwisko,
		kraj: user.kraj,
		wyksztalcenie: user.wyksztalcenie,
		czy_admin: Boolean(user.czy_admin),
		czy_weryfikacja: Boolean(user.czy_weryfikacja)
	};
}

function normalizeOptional(value) {
	if (typeof value !== "string") return null;

	const trimmed = value.trim();
	return trimmed || null;
}

function validateProfile(body) {
	const { nazwa, email } = body;

	if (typeof nazwa !== "string" || !nazwa.trim()) {
		return "Podaj nazwę użytkownika";
	}
	if (nazwa.trim().length > 30) {
		return "Nazwa użytkownika może mieć maksymalnie 30 znaków";
	}
	if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return "Podaj poprawny adres e-mail";
	}
	if (email.length > 45) {
		return "Adres e-mail może mieć maksymalnie 45 znaków";
	}

	for (const [field, maxLength, label] of optionalFields) {
		const value = body[field];

		if (value !== undefined && value !== null && typeof value !== "string") {
			return `Nieprawidłowa wartość pola ${label}`;
		}
		if (typeof value === "string" && value.trim().length > maxLength) {
			return `${label} może mieć maksymalnie ${maxLength} znaków`;
		}
	}

	return null;
}

router.use(requireAuth);

router.get("/", (req, res) => {
	res.status(200).json({ user: buildProfile(req.user) });
});

router.put("/", async (req, res) => {
	const body = req.body ?? {};
	const error = validateProfile(body);

	if (error) {
		return res.status(400).json({ error });
	}

	const nazwa = body.nazwa.trim();
	const email = body.email.trim();

	const userWithName = await getUserByName(nazwa);
	if (userWithName && userWithName.id_uzytkownik !== req.user.id_uzytkownik) {
		return res.status(409).json({ error: "Ta nazwa użytkownika jest już zajęta" });
	}

	const userWithEmail = await getUserByEmail(email);
	if (userWithEmail && userWithEmail.id_uzytkownik !== req.user.id_uzytkownik) {
		return res.status(409).json({ error: "Ten adres e-mail jest już zajęty" });
	}

	let user;
	try {
		user = await updateUserProfile(req.user.id_uzytkownik, {
			nazwa,
			email,
			imie: normalizeOptional(body.imie),
			nazwisko: normalizeOptional(body.nazwisko),
			kraj: normalizeOptional(body.kraj),
			wyksztalcenie: normalizeOptional(body.wyksztalcenie)
		});
	} catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res.status(409).json({ error: "Nazwa użytkownika lub adres e-mail są już zajęte" });
		}
		throw err;
	}

	res.status(200).json({
		message: "Profil został zaktualizowany",
		user: buildProfile(user)
	});
});

router.patch("/otp", async (req, res) => {
	const { enabled } = req.body ?? {};

	if (typeof enabled !== "boolean") {
		return res.status(400).json({ error: "Podaj poprawny stan weryfikacji" });
	}

	const user = await setUserVerification(req.user.id_uzytkownik, enabled);

	res.status(200).json({
		message: enabled
			? "Weryfikacja dwuetapowa została włączona"
			: "Weryfikacja dwuetapowa została wyłączona",
		user: buildProfile(user)
	});
});

router.put("/password", async (req, res) => {
	const { currentPassword, newPassword } = req.body ?? {};

	if (typeof currentPassword !== "string" || !currentPassword) {
		return res.status(400).json({ error: "Podaj obecne hasło" });
	}
	if (typeof newPassword !== "string" || !newPassword) {
		return res.status(400).json({ error: "Podaj nowe hasło" });
	}
	if (newPassword.length > 255) {
		return res.status(400).json({ error: "Hasło jest zbyt długie" });
	}

	const credentials = await getUserPasswordById(req.user.id_uzytkownik);

	if (!credentials || !(await verifyPassword(credentials.haslo, currentPassword))) {
		return res.status(401).json({ error: "Obecne hasło jest nieprawidłowe" });
	}

	await updateUserPassword(req.user.id_uzytkownik, newPassword);

	res.status(200).json({ message: "Hasło zostało zmienione" });
});

router.delete("/", async (req, res) => {
	const { password } = req.body ?? {};

	if (typeof password !== "string" || !password) {
		return res.status(400).json({ error: "Podaj hasło, aby usunąć konto" });
	}

	const credentials = await getUserPasswordById(req.user.id_uzytkownik);

	if (!credentials || !(await verifyPassword(credentials.haslo, password))) {
		return res.status(401).json({ error: "Hasło jest nieprawidłowe" });
	}

	try {
		await deleteUser(req.user.id_uzytkownik);
	} catch (err) {
		if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
			return res.status(409).json({
				error: "Nie można usunąć konta, ponieważ jest powiązane z kursami"
			});
		}
		throw err;
	}

	await deleteAllSessions(req.user.id_uzytkownik);
	await deleteOtp(req.user.id_uzytkownik);

	clearRefreshCookie(res);
	res.status(200).json({ message: "Konto zostało usunięte" });
});

router.use((err, _req, res, _) => {
	res.status(500).json({ error: err.message });
});

export default router;
