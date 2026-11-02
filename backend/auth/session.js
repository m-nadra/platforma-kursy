import { generateAccessToken, generateRefreshToken, REFRESH_TTL_MS } from "./jwt.js";
import { newSessionId, saveRefreshToken } from "../redis/index.js";

const COOKIE_NAME = "refresh_token";

const cookieOptions = {
	path: "/api/auth",
	httpOnly: true,
	sameSite: "strict",
	secure: process.env.NODE_ENV === "production"
};

export function clearRefreshCookie(res) {
	res.clearCookie(COOKIE_NAME, cookieOptions);
}

function buildAccessSession(user) {
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

export async function startSession(res, user) {
	const sid = newSessionId();
	const refreshToken = generateRefreshToken(user.id_uzytkownik, sid);
	await saveRefreshToken(user.id_uzytkownik, sid, refreshToken);

	res.cookie(COOKIE_NAME, refreshToken, { ...cookieOptions, maxAge: REFRESH_TTL_MS });
	return buildAccessSession(user);
}

export { COOKIE_NAME as REFRESH_COOKIE };