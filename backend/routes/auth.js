import { Router } from "express";
import {
	createUser,
	getUserById,
	getUserCredentials,
	updateUserPassword
} from "../db/users.js";
import { needsRehash, verifyPassword } from "../auth/hashing.js";
import { generateOtpToken, tryVerifyToken } from "../auth/jwt.js";
import { REFRESH_COOKIE, clearRefreshCookie, startSession } from "../auth/session.js";
import { sendLoginOtp } from "../auth/otp.js";
import { parseRegistration } from "../auth/validation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
	deleteSession,
	isRefreshTokenValid,
	verifyAndConsumeOtp
} from "../redis/index.js";

const router = Router();

const OTP_ERROR = { error: "Kod wygasł lub jest nieprawidłowy" };
const REFRESH_ERROR = { error: "Invalid refresh token" };

router.post("/register", asyncHandler(async (req, res) => {
	const { error, data } = parseRegistration(req.body);
	if (error) {
		return res.status(400).json({ error });
	}

	let user;
	try {
		user = await createUser(data);
	} catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res
				.status(409)
				.json({ error: "Nazwa użytkownika lub adres e-mail są już zajęte" });
		}
		throw err;
	}

	res.status(201).json({
		message: "Registration successful",
		...(await startSession(res, user))
	});
}));

router.post("/login", asyncHandler(async (req, res) => {
	const { login, password } = req.body ?? {};
	if (typeof login !== "string" || typeof password !== "string") {
		return res.status(400).json({ error: "Podaj login i hasło" });
	}

	const user = await getUserCredentials(login.trim());

	if (!(await verifyPassword(user?.haslo, password))) {
		return res.status(401).json({ error: "Invalid username or password" });
	}

	if (needsRehash(user.haslo)) {
		updateUserPassword(user.id_uzytkownik, password).catch((err) =>
			console.error("Password rehash failed:", err)
		);
	}

	if (user.czy_weryfikacja) {
		await sendLoginOtp(user);
		return res.status(200).json({
			message: "OTP required",
			otpRequired: true,
			otpToken: generateOtpToken(user.id_uzytkownik)
		});
	}

	res.status(200).json({
		message: "Login successful",
		...(await startSession(res, user))
	});
}));

router.post("/login/otp", asyncHandler(async (req, res) => {
	const { otpToken, code } = req.body ?? {};
	if (typeof otpToken !== "string" || typeof code !== "string" || !/^\d{6}$/.test(code)) {
		return res.status(400).json({ error: "Nieprawidłowy kod weryfikacyjny" });
	}

	const payload = tryVerifyToken(otpToken, "otp");
	if (!payload) {
		return res.status(401).json(OTP_ERROR);
	}

	const result = await verifyAndConsumeOtp(payload.id, code);
	if (result === -1) {
		return res.status(429).json({ error: "Zbyt wiele prób, zaloguj się ponownie" });
	}
	if (result !== 1) {
		return res.status(401).json(OTP_ERROR);
	}

	const user = await getUserById(payload.id);
	if (!user) {
		return res.status(401).json(OTP_ERROR);
	}

	res.status(200).json({
		message: "Login successful",
		...(await startSession(res, user))
	});
}));

router.post("/refresh", asyncHandler(async (req, res) => {
	const token = req.cookies[REFRESH_COOKIE];
	const payload = tryVerifyToken(token, "refresh");

	if (!payload?.sid) {
		clearRefreshCookie(res);
		return res.status(401).json(REFRESH_ERROR);
	}

	const { id, sid } = payload;
	const user = (await isRefreshTokenValid(id, sid, token)) ? await getUserById(id) : null;

	if (!user) {
		await deleteSession(id, sid);
		clearRefreshCookie(res);
		return res.status(401).json(REFRESH_ERROR);
	}

	res.status(200).json({
		message: "Token refreshed",
		...(await startSession(res, user, sid))
	});
}));

router.post("/logout", asyncHandler(async (req, res) => {
	const payload = tryVerifyToken(req.cookies[REFRESH_COOKIE], "refresh");

	if (payload?.sid) {
		await deleteSession(payload.id, payload.sid);
	}

	clearRefreshCookie(res);
	res.status(200).json({ message: "Logout successful" });
}));

export default router;