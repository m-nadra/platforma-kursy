import { verifyToken } from "../auth/jwt.js";
import { getUserById } from "../db/users.js";

export async function requireAuth(req, res, next) {
	try {
		const [scheme, token] = (req.headers.authorization ?? "").split(" ");

		if (scheme !== "Bearer" || !token) {
			return res.status(401).json({ error: "Brak autoryzacji", code: "NO_TOKEN" });
		}

		let payload;
		try {
			payload = verifyToken(token, "access");
		} catch (err) {
			const code = err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
			return res.status(401).json({ error: "Sesja wygasła", code });
		}

		const user = await getUserById(payload.id);
		if (!user) {
			return res.status(401).json({ error: "Sesja wygasła", code: "INVALID_TOKEN" });
		}

		req.user = user;
		next();
	} catch (err) {
		next(err);
	}
}