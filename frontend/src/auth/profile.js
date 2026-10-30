const API_URL = "/api/profile";

async function request(authFetch, path = "", { method = "GET", body } = {}) {
	try {
		const response = await authFetch(`${API_URL}${path}`, {
			method,
			headers: body ? { "Content-Type": "application/json" } : undefined,
			body: body ? JSON.stringify(body) : undefined,
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

export function getProfile(authFetch) {
	return request(authFetch);
}

export function updateProfile(authFetch, profile) {
	return request(authFetch, "", { method: "PUT", body: profile });
}

export function setOtp(authFetch, enabled) {
	return request(authFetch, "/otp", { method: "PATCH", body: { enabled } });
}

export function changePassword(authFetch, currentPassword, newPassword) {
	return request(authFetch, "/password", {
		method: "PUT",
		body: { currentPassword, newPassword },
	});
}

export function deleteAccount(authFetch, password) {
	return request(authFetch, "", { method: "DELETE", body: { password } });
}
