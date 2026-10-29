const API_URL = "/api/auth";

export async function login(login, password) {
	let response;

	try {
		response = await fetch(`${API_URL}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ login, password }),
		});
	} catch {
		return { error: "Nie udało się połączyć z serwerem" };
	}

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		const message =
			response.status === 401
				? "Nieprawidłowa nazwa użytkownika lub hasło"
				: data.error || "Wystąpił błąd podczas logowania";

		return { error: message };
	}

	return { data };
}
