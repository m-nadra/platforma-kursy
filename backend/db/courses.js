import { query, queryOne } from './pool.js';

export async function listCourses({ limit = 50, offset = 0 } = {}) {
  return query(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
            kat.nazwa AS kategoria, u.nazwa AS autor
     FROM kursy k
     JOIN kategorie_kursow kat ON kat.id_kategoria_kursu = k.id_kategoria_kursu
     JOIN uzytkownicy u ON u.id_uzytkownik = k.autor
     ORDER BY k.data_utworzenia DESC
     LIMIT :limit OFFSET :offset`,
    { limit, offset }
  );
}

export async function getCourseById(id) {
  return queryOne(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
            k.id_kategoria_kursu, kat.nazwa AS kategoria,
            k.autor, u.nazwa AS autor_nazwa
     FROM kursy k
     JOIN kategorie_kursow kat ON kat.id_kategoria_kursu = k.id_kategoria_kursu
     JOIN uzytkownicy u ON u.id_uzytkownik = k.autor
     WHERE k.id_kurs = :id`,
    { id }
  );
}

export async function listCategories() {
  return query(
    `SELECT id_kategoria_kursu, nazwa
     FROM kategorie_kursow
     ORDER BY nazwa`
  );
}

export async function listCoursesByCategory(idKategoria) {
  return query(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu, u.nazwa AS autor
     FROM kursy k
     JOIN uzytkownicy u ON u.id_uzytkownik = k.autor
     WHERE k.id_kategoria_kursu = :idKategoria
     ORDER BY k.data_utworzenia DESC`,
    { idKategoria }
  );
}

export async function listCoursesByAuthor(idAutor) {
  return query(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
            kat.nazwa AS kategoria
     FROM kursy k
     JOIN kategorie_kursow kat ON kat.id_kategoria_kursu = k.id_kategoria_kursu
     WHERE k.autor = :idAutor
     ORDER BY k.data_utworzenia DESC`,
    { idAutor }
  );
}

export async function searchCourses(searchTerm) {
  return query(
    `SELECT k.id_kurs, k.nazwa, k.data_utworzenia, k.obraz_podgladu,
            kat.nazwa AS kategoria, u.nazwa AS autor
     FROM kursy k
     JOIN kategorie_kursow kat ON kat.id_kategoria_kursu = k.id_kategoria_kursu
     JOIN uzytkownicy u ON u.id_uzytkownik = k.autor
     WHERE k.nazwa LIKE :term
     ORDER BY k.nazwa`,
    { term: `%${searchTerm}%` }
  );
}
