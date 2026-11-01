import { verifyPassword } from "./hashing.js";
import { getUserPasswordById } from "../db/users.js";

export async function confirmPassword(userId, password) {
	const credentials = await getUserPasswordById(userId);
	return verifyPassword(credentials?.haslo, password);
}