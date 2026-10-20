/* Schema delle tabelle SQLite (clienti, parametri_anno, voci, valori, budget_var, vendite, cashflow, cestino). */
const SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS clienti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ragione_sociale TEXT NOT NULL,
  partita_iva TEXT,
  note TEXT,
  anno_base INTEGER NOT NULL,
  anno_sync INTEGER,             -- ultimo esercizio creato in automatico (vedi modules/anni/service/sincronizza.js)
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
CREATE TABLE IF NOT EXISTS cestino (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,            -- cliente | anno | voci | azzera_valori | azzera_vendite | azzera_parametri
  cliente_id INTEGER,            -- senza FOREIGN KEY: la voce resta nel cestino anche se il cliente è stato eliminato
  cliente_nome TEXT,
  etichetta TEXT NOT NULL,       -- cosa è stato eliminato (testo per l'elenco)
  dettaglio TEXT,
  n_dati INTEGER DEFAULT 0,      -- quanti valori contiene la copia
  dati_json TEXT NOT NULL,       -- copia dei dati eliminati, usata per il ripristino
  data_eliminazione TEXT NOT NULL,
  scade_il TEXT NOT NULL         -- dopo questa data viene eliminata definitivamente (15 giorni)
);
CREATE INDEX IF NOT EXISTS idx_cestino_scadenza ON cestino(scade_il);
`;

module.exports = { SCHEMA };
