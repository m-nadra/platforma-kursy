import { query, queryOne } from './pool.js';
import { hashPassword } from '../auth/hashing.js';

export async function listUsers({ limit = 50, offset = 0 } = {}) {
  return query(
    `SELECT id_uzytkownik, nazwa, email, imie, nazwisko, kraj, wyksztalcenie, czy_admin, czy_weryfikacja
     FROM uzytkownicy
     ORDER BY id_uzytkownik
     LIMIT :limit OFFSET :offset`,
    { limit, offset }
  );
}

export async function getUserById(id) {
  return queryOne(
    `SELECT id_uzytkownik, nazwa, email, imie, nazwisko, kraj, wyksztalcenie, czy_admin, czy_weryfikacja
     FROM uzytkownicy
     WHERE id_uzytkownik = :id`,
    { id }
  );
}

export async function getUserByName(nazwa) {
  return queryOne(
    `SELECT id_uzytkownik, nazwa, email, imie, nazwisko, kraj, wyksztalcenie, czy_admin, czy_weryfikacja
     FROM uzytkownicy
     WHERE nazwa = :nazwa`,
    { nazwa }
  );
}

export async function getUserByEmail(email) {
  return queryOne(
    `SELECT id_uzytkownik, nazwa, email, imie, nazwisko, kraj, wyksztalcenie, czy_admin, czy_weryfikacja
     FROM uzytkownicy
     WHERE email = :email`,
    { email }
  );
}

export async function getUserCredentials(nazwa) {
  return queryOne(
    `SELECT id_uzytkownik, nazwa, email, haslo, czy_admin, czy_weryfikacja
     FROM uzytkownicy
     WHERE nazwa = :nazwa OR email = :nazwa`,
    { nazwa }
  );
}

export async function createUser({ nazwa, email, password }) {
  const haslo = await hashPassword(password);

  const result = await query(
    `INSERT INTO uzytkownicy (nazwa, haslo, email, czy_admin, czy_weryfikacja)
     VALUES (:nazwa, :haslo, :email, 0, 0)`,
    { nazwa, haslo, email }
  );

  return {
    id_uzytkownik: result.insertId,
    nazwa,
    email,
    czy_admin: 0,
    czy_weryfikacja: 0
  };
}

export async function ensureAdminUser(password, email) {
  const existing = await queryOne(
    `SELECT id_uzytkownik FROM uzytkownicy WHERE nazwa = :nazwa`,
    { nazwa: 'admin' }
  );
  if (existing) return false;

  const haslo = await hashPassword(password);
  await query(
    `INSERT INTO uzytkownicy (nazwa, haslo, email, czy_admin, czy_weryfikacja)
     VALUES (:nazwa, :haslo, :email, 1, 0)`,
    { nazwa: 'admin', haslo, email: email }
  );
  return true;
}

export async function listAdmins() {
  return query(
    `SELECT id_uzytkownik, nazwa, email, imie, nazwisko
     FROM uzytkownicy
     WHERE czy_admin = 1
     ORDER BY nazwa`
  );
}
