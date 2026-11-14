/* Connessione SQLite (sql.js = SQLite compilato in WebAssembly: nessuna compilazione nativa).
   Il file .db è un vero database SQLite3 apribile con qualunque client (DB Browser, sqlite3 CLI…). */
const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const { TABELLE, INDICI } = require("./schema");
const { migra, daMigrare, versione, VERSIONE } = require("./migrazioni");

const DB_DIR =
  process.env.DB_DIR || path.join(__dirname, "..", "..", "..", "db");
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "gestionale.db");

let db = null;
let saveTimer = null;

const getDb = () => db;
const dbPath = () => DB_PATH;

/* Copia di sicurezza del file prima di aggiornarlo (si tengono le ultime 3). Se la copia fallisce non si procede. */
function backupPrimaDiMigrare() {
  const base = path.basename(DB_PATH, path.extname(DB_PATH));
  const nome = `${base}.pre-migrazione-${new Date().toISOString().replace(/[:.]/g, "-")}.db`;
  const dir = path.dirname(DB_PATH);
  fs.copyFileSync(DB_PATH, path.join(dir, nome));
  fs.readdirSync(dir)
    .filter((f) => f.startsWith(base + ".pre-migrazione-"))
    .sort()
    .slice(0, -3)
    .forEach((f) => fs.rmSync(path.join(dir, f), { force: true }));
  return nome;
}

async function init() {
  const SQL = await initSqlJs();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const esisteva = fs.existsSync(DB_PATH);
  if (esisteva) {
    try {
      db = new SQL.Database(fs.readFileSync(DB_PATH));
      db.exec("SELECT COUNT(*) FROM sqlite_master"); // fallisce se il file non è un database valido
    } catch (e) {
      throw new Error(
        `Il file ${DB_PATH} non è un database SQLite leggibile (${e.message}). Il file non è stato modificato.`,
      );
    }
    console.log("✅ Database caricato:", DB_PATH);
  } else {
    db = new SQL.Database();
    console.log("🆕 Nuovo database:", DB_PATH);
  }
  // 1) tabelle mancanti  2) colonne mancanti e riparazione dati (migrazioni)  3) indici
  db.exec(TABELLE);
  if (esisteva && daMigrare(db)) {
    const copia = backupPrimaDiMigrare();
    console.log(
      `🔧 Aggiornamento del database (versione ${versione(db)} → ${VERSIONE}), copia di sicurezza: ${copia}`,
    );
  }
  migra(db);
  db.exec(INDICI);
  db.exec("PRAGMA foreign_keys = ON;");
  flush();
  return db;
}

/* Scrive subito il database su file (scrittura atomica tramite file temporaneo). */
function flush() {
  if (!db) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  const data = db.export(); // export() azzera i PRAGMA: li riattiviamo
  db.exec("PRAGMA foreign_keys = ON;");
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, Buffer.from(data));
  fs.renameSync(tmp, DB_PATH);
}

/* Salvataggio differito: raggruppa più scritture ravvicinate in una sola. */
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 200);
}

module.exports = { init, flush, scheduleSave, getDb, dbPath };
