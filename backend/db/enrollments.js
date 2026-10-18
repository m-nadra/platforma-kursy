import { query, queryOne } from './pool.js';

export async function listEnrollmentsByUser(idUzytkownik) {
  return query(
    `SELECT uk.id_kurs, k.nazwa, k.obraz_podgladu, uk.data_zapisania,
            uk.data_ukonczenia, uk.data_modyfikacji
     FROM uzytkownicy_kursy uk
     JOIN kursy k ON k.id_kurs = uk.id_kurs
     WHERE uk.id_uzytkownik = :idUzytkownik
     ORDER BY uk.data_zapisania DESC`,
    { idUzytkownik }
  );
}

export async function listEnrollmentsByCourse(idKurs) {
  return query(
    `SELECT uk.id_uzytkownik, u.nazwa, u.email, uk.data_zapisania,
            uk.data_ukonczenia, uk.data_modyfikacji
     FROM uzytkownicy_kursy uk
     JOIN uzytkownicy u ON u.id_uzytkownik = uk.id_uzytkownik
     WHERE uk.id_kurs = :idKurs
     ORDER BY uk.data_zapisania DESC`,
    { idKurs }
  );
}

export async function getEnrollment(idUzytkownik, idKurs) {
  return queryOne(
    `SELECT id_uzytkownik, id_kurs, data_zapisania, data_ukonczenia, data_modyfikacji
     FROM uzytkownicy_kursy
     WHERE id_uzytkownik = :idUzytkownik AND id_kurs = :idKurs`,
    { idUzytkownik, idKurs }
  );
}

export async function getCourseProgress(idUzytkownik, idKurs) {
  return queryOne(
    `SELECT
        (SELECT COUNT(*) FROM podrozdzialy p
           JOIN rozdzialy r ON r.id_rozdzial = p.id_rozdzial
          WHERE r.id_kurs = :idKurs) AS ile_podrozdzialow,
        (SELECT COUNT(*) FROM zakonczone_podrozdzialy z
           JOIN podrozdzialy p ON p.id_podrozdzial = z.id_podrozdzial
           JOIN rozdzialy r ON r.id_rozdzial = p.id_rozdzial
          WHERE r.id_kurs = :idKurs AND z.id_uzytkownik = :idUzytkownik) AS ukonczone`,
    { idUzytkownik, idKurs }
  );
}

export async function listCompletedSubchapters(idUzytkownik) {
  return query(
    `SELECT z.id_podrozdzial, p.nazwa, p.rodzaj, r.id_kurs
     FROM zakonczone_podrozdzialy z
     JOIN podrozdzialy p ON p.id_podrozdzial = z.id_podrozdzial
     JOIN rozdzialy r ON r.id_rozdzial = p.id_rozdzial
     WHERE z.id_uzytkownik = :idUzytkownik`,
    { idUzytkownik }
  );
}

export async function listCourseCompletionCount() {
  return query(
    `SELECT k.id_kurs, k.nazwa, COUNT(uk.id_uzytkownik) AS ile_zapisow
     FROM kursy k
     LEFT JOIN uzytkownicy_kursy uk ON uk.id_kurs = k.id_kurs
     GROUP BY k.id_kurs, k.nazwa
     ORDER BY ile_zapisow DESC`
  );
}
