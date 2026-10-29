const API_URL = "/api/auth";

async function post(path, body) {
	try {
		const response = await fetch(`${API_URL}${path}`, {
			method: "POST",
			headers: body ? { "Content-Type": "application/json" } : undefined,
			body: body ? JSON.stringify(body) : undefined,
			credentials: "same-origin",
		});

		const data = await response.json().catch(() => ({}));

		return { response, data };
	} catch {
		return { error: "Nie udało się połączyć z serwerem" };
	}
}

export async function login(login, password) {
	const { response, data, error } = await post("/login", { login, password });

	if (error) return { error };

	if (!response.ok) {
		const message =
			response.status === 401
				? "Nieprawidłowa nazwa użytkownika lub hasło"
				: data.error || "Wystąpił błąd podczas logowania";

		return { error: message };
	}

	return { data };
}

export async function refresh() {
	const { response, data, error } = await post("/refresh");

	if (error || !response.ok) return { error: error || data.error };

	return { data };
}

export async function logout() {
	const { error } = await post("/logout");

	return { error };
}
