/* Connessione SQLite (sql.js = SQLite compilato in WebAssembly: nessuna compilazione nativa).
   Il file .db è un vero database SQLite3 apribile con qualunque client (DB Browser, sqlite3 CLI…). */
const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const { SCHEMA } = require("./schema");
const { migra } = require("./migrazioni");

const DB_DIR =
  process.env.DB_DIR || path.join(__dirname, "..", "..", "..", "db");
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "gestionale.db");

let db = null;
let saveTimer = null;

const getDb = () => db;
const dbPath = () => DB_PATH;

async function init() {
  const SQL = await initSqlJs();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
    console.log("✅ Database caricato:", DB_PATH);
  } else {
    db = new SQL.Database();
    console.log("🆕 Nuovo database:", DB_PATH);
  }
  db.exec(SCHEMA);
  migra(db); // aggiorna i database creati con versioni precedenti
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
