import { Router } from "express";
import { getUserCredentials } from "../db/users.js";
import { verifyPassword } from "../auth/hashing.js";
import { generateAccessToken } from "../auth/jwt.js"

const router = Router();

router.post("/login", async (req, res) => {
	const user = await getUserCredentials(req.body.login);
    
	if (!user || !(await verifyPassword(user.haslo, req.body.password))) {
		return res.status(401).json({ error: "Invalid username or password" });
	}

    if (user.czy_weryfikacja) {
        /// OTP verification
    }
	// TODO! Refresh token
	
	res.status(200).json({
		message: "Login successful",
		accessToken: generateAccessToken({
            id: user.id_uzytkownik,
            username: user.nazwa,
            czy_admin: user.czy_admin
        }),
		is_admin: user.czy_admin,
		type: "Bearer"
	});
});

router.use((err, _req, res, _) => {
	res.status(500).json({ error: err.message });
});

export default router;