import { query, queryOne } from './pool.js';

export async function listChaptersByCourse(idKurs) {
  return query(
    `SELECT id_rozdzial, nazwa, kolejnosc
     FROM rozdzialy
     WHERE id_kurs = :idKurs
     ORDER BY kolejnosc`,
    { idKurs }
  );
}

export async function getChapterById(id) {
  return queryOne(
    `SELECT id_rozdzial, nazwa, kolejnosc, id_kurs
     FROM rozdzialy
     WHERE id_rozdzial = :id`,
    { id }
  );
}

export async function listSubchaptersByChapter(idRozdzial) {
  return query(
    `SELECT id_podrozdzial, nazwa, rodzaj, kolejnosc
     FROM podrozdzialy
     WHERE id_rozdzial = :idRozdzial
     ORDER BY kolejnosc`,
    { idRozdzial }
  );
}

export async function getSubchapterById(id) {
  return queryOne(
    `SELECT p.id_podrozdzial, p.nazwa, p.rodzaj, p.kolejnosc, p.id_rozdzial,
            r.nazwa AS rozdzial, r.id_kurs
     FROM podrozdzialy p
     JOIN rozdzialy r ON r.id_rozdzial = p.id_rozdzial
     WHERE p.id_podrozdzial = :id`,
    { id }
  );
}

export async function listMaterialsBySubchapter(idPodrozdzial) {
  return query(
    `SELECT id_material, rodzaj, kolejnosc, zawartosc
     FROM materialy
     WHERE id_podrozdzial = :idPodrozdzial
     ORDER BY kolejnosc`,
    { idPodrozdzial }
  );
}

export async function getMaterialById(id) {
  return queryOne(
    `SELECT id_material, rodzaj, kolejnosc, zawartosc, id_podrozdzial
     FROM materialy
     WHERE id_material = :id`,
    { id }
  );
}

export async function getCourseStructure(idKurs) {
  const chapters = await listChaptersByCourse(idKurs);
  for (const chapter of chapters) {
    const subchapters = await listSubchaptersByChapter(chapter.id_rozdzial);
    for (const sub of subchapters) {
      sub.materialy = await listMaterialsBySubchapter(sub.id_podrozdzial);
    }
    chapter.podrozdzialy = subchapters;
  }
  return chapters;
}
