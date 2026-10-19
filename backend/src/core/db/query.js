/* Query helper sopra la connessione: all, one, run, insert, tx. */
const { getDb, scheduleSave } = require("./connection");

function all(sql, params = []) {
  const stmt = getDb().prepare(sql);
  try {
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

const one = (sql, params = []) => all(sql, params)[0] || null;

function run(sql, params = []) {
  getDb().run(sql, params);
  scheduleSave();
}

function insert(sql, params = []) {
  getDb().run(sql, params);
  const id = one("SELECT last_insert_rowid() AS id").id;
  scheduleSave();
  return id;
}

/* Transazione: COMMIT se la funzione termina, ROLLBACK se lancia un errore. */
function tx(fn) {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const r = fn();
    db.exec("COMMIT");
    scheduleSave();
    return r;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

module.exports = { all, one, run, insert, tx };
