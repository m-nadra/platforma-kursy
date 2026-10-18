import { query, queryOne } from './pool.js';

export async function listReports({ archived = null, limit = 50, offset = 0 } = {}) {
  const params = { limit, offset };
  let filter = '';
  if (archived !== null) {
    filter = ' AND z.czy_archiwalne = :archived';
    params.archived = archived ? 1 : 0;
  }
  return query(
    `SELECT z.id_zgloszenie, z.temat, z.tresc, z.data_zgloszenia, z.czy_archiwalne,
            z.id_zglaszajacy, u.nazwa AS zglaszajacy
     FROM zgloszenia z
     JOIN uzytkownicy u ON u.id_uzytkownik = z.id_zglaszajacy
     WHERE 1 = 1${filter}
     ORDER BY z.data_zgloszenia DESC
     LIMIT :limit OFFSET :offset`,
    params
  );
}

export async function listReportsByUser(idUzytkownik) {
  return query(
    `SELECT id_zgloszenie, temat, tresc, data_zgloszenia, czy_archiwalne
     FROM zgloszenia
     WHERE id_zglaszajacy = :idUzytkownik
     ORDER BY data_zgloszenia DESC`,
    { idUzytkownik }
  );
}

export async function getReportById(id) {
  return queryOne(
    `SELECT z.id_zgloszenie, z.temat, z.tresc, z.data_zgloszenia, z.czy_archiwalne,
            z.id_zglaszajacy, u.nazwa AS zglaszajacy, u.email
     FROM zgloszenia z
     JOIN uzytkownicy u ON u.id_uzytkownik = z.id_zglaszajacy
     WHERE z.id_zgloszenie = :id`,
    { id }
  );
}
