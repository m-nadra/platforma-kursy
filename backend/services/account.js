import { deleteUser, listAdmins, updateUserPassword } from "../db/users.js";
import { deleteAllSessions, deleteOtp } from "../redis/index.js";

export async function changePassword(userId, newPassword) {
	await updateUserPassword(userId, newPassword);
	await deleteAllSessions(userId);
}

export async function deleteAccount(user) {
	if (user.czy_admin && (await listAdmins()).length <= 1) {
		return { error: "LAST_ADMIN" };
	}

	try {
		await deleteUser(user.id_uzytkownik);
	} catch (err) {
		if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
			return { error: "HAS_COURSES" };
		}
		throw err;
	}

	await Promise.all([deleteAllSessions(user.id_uzytkownik), deleteOtp(user.id_uzytkownik)]);
	return { ok: true };
}