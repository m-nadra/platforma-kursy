import { randomInt } from "node:crypto";
import { deleteOtp, saveOtp } from "../redis/index.js";
import { sendOtpEmail } from "../email/mailer.js";

const generateOtpCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export async function sendLoginOtp(user) {
	const code = generateOtpCode();
	await saveOtp(user.id_uzytkownik, code);

	try {
		await sendOtpEmail(user.email, code);
	} catch (err) {
		await deleteOtp(user.id_uzytkownik);
		throw err;
	}
}