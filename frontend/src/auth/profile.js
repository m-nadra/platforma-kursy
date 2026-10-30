const API_URL = "/api/auth/profile";

async function request(path = "", { method = "GET", body } = {}) {
	try {
		const response = await fetch(`${API_URL}${path}`, {
			method,
			headers: body ? { "Content-Type": "application/json" } : undefined,
			body: body ? JSON.stringify(body) : undefined,
			credentials: "same-origin",
		});

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			return { error: data.error || "Wystąpił błąd" };
		}

		return { data };
	} catch {
		return { error: "Nie udało się połączyć z serwerem" };
	}
}

export function getProfile() {
	return request();
}

export function updateProfile(profile) {
	return request("", { method: "PUT", body: profile });
}

export function setOtp(enabled) {
	return request("/otp", { method: "PATCH", body: { enabled } });
}

export function changePassword(currentPassword, newPassword) {
	return request("/password", {
		method: "PUT",
		body: { currentPassword, newPassword },
	});
}

export function deleteAccount(password) {
	return request("", { method: "DELETE", body: { password } });
}
