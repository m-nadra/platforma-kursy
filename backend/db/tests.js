import { query, queryOne } from './pool.js';

export async function getTestBySubchapter(idPodrozdzial) {
  return queryOne(
    `SELECT id_test, id_podrozdzial
     FROM testy
     WHERE id_podrozdzial = :idPodrozdzial`,
    { idPodrozdzial }
  );
}

export async function getTestById(id) {
  return queryOne(
    `SELECT t.id_test, t.id_podrozdzial, p.nazwa AS podrozdzial, r.id_kurs
     FROM testy t
     JOIN podrozdzialy p ON p.id_podrozdzial = t.id_podrozdzial
     JOIN rozdzialy r ON r.id_rozdzial = p.id_rozdzial
     WHERE t.id_test = :id`,
    { id }
  );
}

export async function listQuestionsByTest(idTest) {
  return query(
    `SELECT id_pytanie, tresc
     FROM pytania
     WHERE id_test = :idTest
     ORDER BY id_pytanie`,
    { idTest }
  );
}

export async function listAnswersByQuestion(idPytanie) {
  return query(
    `SELECT id_odpowiedz, tresc, czy_poprawna
     FROM odpowiedzi
     WHERE id_pytanie = :idPytanie
     ORDER BY id_odpowiedz`,
    { idPytanie }
  );
}

export async function getTestWithQuestions(idTest) {
  const test = await getTestById(idTest);
  if (!test) return null;
  const questions = await listQuestionsByTest(idTest);
  for (const question of questions) {
    question.odpowiedzi = await listAnswersByQuestion(question.id_pytanie);
  }
  test.pytania = questions;
  return test;
}

export async function listAttemptsByUser(idUzytkownik, idTest = null) {
  const params = { idUzytkownik };
  let filter = '';
  if (idTest !== null) {
    filter = ' AND tp.id_test = :idTest';
    params.idTest = idTest;
  }
  return query(
    `SELECT tp.id_testy_podejscia, tp.id_test, tp.ile_poprawnych, tp.data_podejscia,
            (SELECT COUNT(*) FROM pytania WHERE id_test = tp.id_test) AS ile_pytan
     FROM testy_podejscia tp
     WHERE tp.id_uzytkownik = :idUzytkownik${filter}
     ORDER BY tp.data_podejscia DESC`,
    params
  );
}

export async function listAnswersOfAttempt(idTestyPodejscia) {
  return query(
    `SELECT po.id_odpowiedz, o.tresc, o.czy_poprawna, o.id_pytanie
     FROM podejscie_odpowiedz po
     JOIN odpowiedzi o ON o.id_odpowiedz = po.id_odpowiedz
     WHERE po.id_testy_podejscia = :idTestyPodejscia`,
    { idTestyPodejscia }
  );
}
