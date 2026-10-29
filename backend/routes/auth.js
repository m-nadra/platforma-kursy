import { Router } from "express";
import {
	createUser,
	getUserByEmail,
	getUserById,
	getUserByName,
	getUserCredentials
} from "../db/users.js";
import { verifyPassword } from "../auth/hashing.js";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyToken
} from "../auth/jwt.js";
import {
	deleteRefreshToken,
	getRefreshToken,
	saveRefreshToken
} from "../redis/index.js";

const router = Router();

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 3600 * 1000;

const refreshCookieOptions = {
	path: "/api/auth",
	httpOnly: true,
	sameSite: "strict",
	secure: process.env.NODE_ENV === "production"
};

function clearRefreshCookie(res) {
	res.clearCookie("refresh_token", refreshCookieOptions);
}

function buildSession(user) {
	const isAdmin = Boolean(user.czy_admin);

	return {
		accessToken: generateAccessToken({
			id: user.id_uzytkownik,
			username: user.nazwa,
			czy_admin: isAdmin
		}),
		is_admin: isAdmin,
		type: "Bearer"
	};
}

function validateRegistration(username, email, password) {
	if (typeof username !== "string" || !username.trim()) {
		return "Podaj nazwę użytkownika";
	}
	if (username.trim().length > 30) {
		return "Nazwa użytkownika może mieć maksymalnie 30 znaków";
	}
	if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return "Podaj poprawny adres e-mail";
	}
	if (email.length > 45) {
		return "Adres e-mail może mieć maksymalnie 45 znaków";
	}
	if (typeof password !== "string" || !password) {
		return "Podaj hasło";
	}
	if (password.length > 255) {
		return "Hasło jest zbyt długie";
	}

	return null;
}

router.post("/register", async (req, res) => {
	const { username, email, password } = req.body ?? {};
	const error = validateRegistration(username, email, password);

	if (error) {
		return res.status(400).json({ error });
	}

	const nazwa = username.trim();
	const userEmail = email.trim();

	if (await getUserByName(nazwa)) {
		return res.status(409).json({ error: "Ta nazwa użytkownika jest już zajęta" });
	}

	if (await getUserByEmail(userEmail)) {
		return res.status(409).json({ error: "Ten adres e-mail jest już zajęty" });
	}

	let user;
	try {
		user = await createUser({ nazwa, email: userEmail, password });
	} catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res.status(409).json({ error: "Użytkownik już istnieje" });
		}
		throw err;
	}

	const refreshToken = generateRefreshToken(user.id_uzytkownik);
	await saveRefreshToken(user.id_uzytkownik, refreshToken);

	res.cookie("refresh_token", refreshToken, {
		...refreshCookieOptions,
		maxAge: REFRESH_TOKEN_MAX_AGE
	});

	res.status(201).json({
		message: "Registration successful",
		...buildSession(user)
	});
});

router.post("/login", async (req, res) => {
	const user = await getUserCredentials(req.body.login);

	if (!user || !(await verifyPassword(user.haslo, req.body.password))) {
		return res.status(401).json({ error: "Invalid username or password" });
	}

	if (user.czy_weryfikacja) {
		/// OTP verification
	}

	const refreshToken = generateRefreshToken(user.id_uzytkownik);
	await saveRefreshToken(user.id_uzytkownik, refreshToken);

	res.cookie("refresh_token", refreshToken, {
		...refreshCookieOptions,
		maxAge: REFRESH_TOKEN_MAX_AGE
	});

	res.status(200).json({
		message: "Login successful",
		...buildSession(user)
	});
});

router.post("/refresh", async (req, res) => {
	const token = req.cookies.refresh_token;

	if (!token) {
		return res.status(401).json({ error: "Missing refresh token" });
	}

	let payload;
	try {
		payload = verifyToken(token);
	} catch {
		clearRefreshCookie(res);
		return res.status(401).json({ error: "Invalid refresh token" });
	}

	const storedToken = await getRefreshToken(payload.id);
	if (!storedToken || storedToken !== token) {
		clearRefreshCookie(res);
		return res.status(401).json({ error: "Invalid refresh token" });
	}

	const user = await getUserById(payload.id);
	if (!user) {
		await deleteRefreshToken(payload.id);
		clearRefreshCookie(res);
		return res.status(401).json({ error: "Invalid refresh token" });
	}

	const refreshToken = generateRefreshToken(user.id_uzytkownik);
	await saveRefreshToken(user.id_uzytkownik, refreshToken);

	res.cookie("refresh_token", refreshToken, {
		...refreshCookieOptions,
		maxAge: REFRESH_TOKEN_MAX_AGE
	});

	res.status(200).json({
		message: "Token refreshed",
		...buildSession(user)
	});
});

router.post("/logout", async (req, res) => {
	const token = req.cookies.refresh_token;

	if (token) {
		try {
			const payload = verifyToken(token);
			const storedToken = await getRefreshToken(payload.id);

			if (storedToken === token) {
				await deleteRefreshToken(payload.id);
			}
		} catch {
			/// Invalid or expired token, nothing to remove from Redis
		}
	}

	clearRefreshCookie(res);
	res.status(200).json({ message: "Logout successful" });
});

router.use((err, _req, res, _) => {
	res.status(500).json({ error: err.message });
});

export default router;
