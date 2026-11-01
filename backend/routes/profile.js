import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { clearRefreshCookie, startSession } from "../auth/session.js";
import { confirmPassword } from "../auth/credentials.js";
import { parseProfile, validateNewPassword } from "../auth/validation.js";
import { buildProfile } from "../serializers/profile.js";
import { changePassword, deleteAccount } from "../services/account.js";
import { setUserVerification, updateUserProfile } from "../db/users.js";

const router = Router();

const DELETE_ERRORS = {
	LAST_ADMIN: "Nie można usunąć ostatniego administratora",
	HAS_COURSES: "Nie można usunąć konta, ponieważ jest powiązane z kursami"
};

router.use(requireAuth);

router.get("/", (req, res) => {
	res.status(200).json({ user: buildProfile(req.user) });
});

router.put("/", asyncHandler(async (req, res) => {
	const { error, data } = parseProfile(req.body);
	if (error) {
		return res.status(400).json({ error });
	}

	let user;
	try {
		user = await updateUserProfile(req.user.id_uzytkownik, data);
	} catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res
				.status(409)
				.json({ error: "Nazwa użytkownika lub adres e-mail są już zajęte" });
		}
		throw err;
	}

	res.status(200).json({
		message: "Profil został zaktualizowany",
		user: buildProfile(user)
	});
}));

router.patch("/otp", asyncHandler(async (req, res) => {
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
}));

router.put("/password", asyncHandler(async (req, res) => {
	const { currentPassword, newPassword } = req.body ?? {};

	if (typeof currentPassword !== "string" || !currentPassword) {
		return res.status(400).json({ error: "Podaj obecne hasło" });
	}
	const error = validateNewPassword(newPassword);
	if (error) {
		return res.status(400).json({ error });
	}
	if (newPassword === currentPassword) {
		return res.status(400).json({ error: "Nowe hasło musi różnić się od obecnego" });
	}

	if (!(await confirmPassword(req.user.id_uzytkownik, currentPassword))) {
		return res.status(401).json({ error: "Obecne hasło jest nieprawidłowe" });
	}

	await changePassword(req.user.id_uzytkownik, newPassword);

	res.status(200).json({
		message: "Hasło zostało zmienione",
		...(await startSession(res, req.user))
	});
}));

router.delete("/", asyncHandler(async (req, res) => {
	const { password } = req.body ?? {};

	if (typeof password !== "string" || !password) {
		return res.status(400).json({ error: "Podaj hasło, aby usunąć konto" });
	}

	if (!(await confirmPassword(req.user.id_uzytkownik, password))) {
		return res.status(401).json({ error: "Hasło jest nieprawidłowe" });
	}

	const result = await deleteAccount(req.user);
	if (result.error) {
		return res.status(409).json({ error: DELETE_ERRORS[result.error] });
	}

	clearRefreshCookie(res);
	res.status(200).json({ message: "Konto zostało usunięte" });
}));

export default router;