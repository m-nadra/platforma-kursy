export function buildProfile(user) {
	return {
		id: user.id_uzytkownik,
		nazwa: user.nazwa,
		email: user.email,
		imie: user.imie,
		nazwisko: user.nazwisko,
		kraj: user.kraj,
		wyksztalcenie: user.wyksztalcenie,
		czy_admin: Boolean(user.czy_admin),
		czy_weryfikacja: Boolean(user.czy_weryfikacja)
	};
}