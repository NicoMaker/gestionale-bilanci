/* Database SQLite (sql.js = SQLite compilato in WebAssembly: nessuna compilazione nativa).
   Il file .db è un vero database SQLite3 apribile con qualunque client (DB Browser, sqlite3 CLI…). */
const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const DB_DIR = process.env.DB_DIR || path.join(__dirname, "..", "..", "db");
const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "gestionale.db");

let db = null;
let saveTimer = null;

const SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS clienti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ragione_sociale TEXT NOT NULL,
  partita_iva TEXT,
  note TEXT,
  anno_base INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS parametri_anno (
  cliente_id INTEGER NOT NULL,
  anno INTEGER NOT NULL,
  peso_vendite REAL DEFAULT 1,
  inflazione REAL DEFAULT 0,
  produttivita REAL DEFAULT 0,
  imposte_budget REAL DEFAULT 0,
  investimento REAL DEFAULT 0,
  aumento_utile REAL DEFAULT 0,
  saldo_iniziale_cf REAL DEFAULT 0,
  PRIMARY KEY (cliente_id, anno),
  FOREIGN KEY (cliente_id) REFERENCES clienti(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS voci (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  ambito TEXT NOT NULL,          -- SP | CE | CF
  sezione TEXT NOT NULL,
  codice TEXT DEFAULT '',
  descrizione TEXT DEFAULT '',
  tipo TEXT DEFAULT '',          -- solo CE: IP I P O Z V F
  ordine INTEGER DEFAULT 0,
  fissa INTEGER DEFAULT 0,       -- 1 = riga non eliminabile
  FOREIGN KEY (cliente_id) REFERENCES clienti(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_voci_cliente ON voci(cliente_id, ambito, sezione, ordine);
CREATE TABLE IF NOT EXISTS valori (
  voce_id INTEGER NOT NULL,
  anno INTEGER NOT NULL,
  importo REAL,
  PRIMARY KEY (voce_id, anno),
  FOREIGN KEY (voce_id) REFERENCES voci(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS budget_var (
  voce_id INTEGER NOT NULL,
  anno INTEGER NOT NULL,         -- anno di riferimento (il budget è anno+1)
  valore REAL,
  PRIMARY KEY (voce_id, anno),
  FOREIGN KEY (voce_id) REFERENCES voci(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS vendite (
  cliente_id INTEGER NOT NULL,
  anno INTEGER NOT NULL,
  mese INTEGER NOT NULL,         -- 1..12
  importo REAL,
  PRIMARY KEY (cliente_id, anno, mese),
  FOREIGN KEY (cliente_id) REFERENCES clienti(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS cashflow (
  voce_id INTEGER NOT NULL,
  anno INTEGER NOT NULL,         -- anno di riferimento (il cash flow è dell'anno+1)
  mese INTEGER NOT NULL,
  importo REAL,
  PRIMARY KEY (voce_id, anno, mese),
  FOREIGN KEY (voce_id) REFERENCES voci(id) ON DELETE CASCADE
);
`;

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
  db.exec("PRAGMA foreign_keys = ON;");
  flush();
  return db;
}

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
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 200);
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
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
  db.run(sql, params);
  scheduleSave();
}
function insert(sql, params = []) {
  db.run(sql, params);
  const id = one("SELECT last_insert_rowid() AS id").id;
  scheduleSave();
  return id;
}
function tx(fn) {
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
const dbPath = () => DB_PATH;

module.exports = { init, all, one, run, insert, tx, flush, dbPath };
