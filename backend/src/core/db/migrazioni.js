/* Migrazioni del database: aggiornano in place i file .db creati con versioni precedenti, SENZA doverli cancellare.
   - ogni migrazione è idempotente (si può rieseguire senza danni) e gira dentro una transazione;
   - la versione raggiunta è salvata nel file (PRAGMA user_version): le migrazioni già fatte non vengono rieseguite;
   - prima di modificare un database esistente la connessione ne salva una copia di sicurezza (vedi connection.js);
   - se una migrazione fallisce viene fatto il ROLLBACK e il file originale resta intatto. */

/* Colonne che ogni tabella deve avere. Servono a riparare i database vecchi a cui ne manca qualcuna.
   (ALTER TABLE ADD COLUMN accetta solo default costanti: niente PRIMARY KEY/NOT NULL senza default.) */
const COLONNE_ATTESE = {
  clienti: {
    partita_iva: "TEXT",
    note: "TEXT",
    anno_sync: "INTEGER",
    created_at: "TEXT",
  },
  parametri_anno: {
    peso_vendite: "REAL DEFAULT 1",
    inflazione: "REAL DEFAULT 0",
    produttivita: "REAL DEFAULT 0",
    imposte_budget: "REAL DEFAULT 0",
    investimento: "REAL DEFAULT 0",
    aumento_utile: "REAL DEFAULT 0",
    saldo_iniziale_cf: "REAL DEFAULT 0",
    data_chiusura: "TEXT",
  },
  voci: {
    codice: "TEXT DEFAULT ''",
    descrizione: "TEXT DEFAULT ''",
    tipo: "TEXT DEFAULT ''",
    ordine: "INTEGER DEFAULT 0",
    fissa: "INTEGER DEFAULT 0",
  },
  cestino: {
    cliente_id: "INTEGER",
    cliente_nome: "TEXT",
    dettaglio: "TEXT",
    n_dati: "INTEGER DEFAULT 0",
  },
};

function colonne(db, tabella) {
  const r = db.exec(`PRAGMA table_info(${tabella})`);
  return r.length ? r[0].values.map((v) => v[1]) : [];
}

function aggiungiColonneMancanti(db) {
  for (const [tabella, cols] of Object.entries(COLONNE_ATTESE)) {
    const presenti = colonne(db, tabella);
    if (!presenti.length) continue; // la tabella non esiste: la crea lo schema
    for (const [nome, def] of Object.entries(cols))
      if (!presenti.includes(nome))
        db.exec(`ALTER TABLE ${tabella} ADD COLUMN ${nome} ${def}`);
  }
}

const MIGRAZIONI = [
  /* 1 — colonne introdotte nel tempo (anno_sync, data_chiusura…) e data di chiusura predefinita */
  (db) => {
    aggiungiColonneMancanti(db);
    db.exec(
      "UPDATE parametri_anno SET data_chiusura = printf('%04d-12-31', anno) WHERE data_chiusura IS NULL",
    );
    // ogni esercizio creato senza data (sincronizzazione automatica, demo, ripristino) riceve il 31/12
    db.exec(`CREATE TRIGGER IF NOT EXISTS trg_parametri_anno_data_chiusura
      AFTER INSERT ON parametri_anno
      WHEN NEW.data_chiusura IS NULL
      BEGIN
        UPDATE parametri_anno SET data_chiusura = printf('%04d-12-31', NEW.anno)
        WHERE cliente_id = NEW.cliente_id AND anno = NEW.anno;
      END;`);
  },

  /* 2 — riparazione dei dati esistenti: righe orfane, date incoerenti, anno base non presente tra gli esercizi */
  (db) => {
    // righe orfane (possibili nei file creati quando le chiavi esterne non erano attive)
    db.exec(
      "DELETE FROM valori WHERE voce_id NOT IN (SELECT id FROM voci)",
    );
    db.exec(
      "DELETE FROM budget_var WHERE voce_id NOT IN (SELECT id FROM voci)",
    );
    db.exec(
      "DELETE FROM cashflow WHERE voce_id NOT IN (SELECT id FROM voci)",
    );
    db.exec("DELETE FROM voci WHERE cliente_id NOT IN (SELECT id FROM clienti)");
    db.exec(
      "DELETE FROM vendite WHERE cliente_id NOT IN (SELECT id FROM clienti)",
    );
    db.exec(
      "DELETE FROM parametri_anno WHERE cliente_id NOT IN (SELECT id FROM clienti)",
    );
    // data di chiusura mancante, vuota o fuori dall'anno dell'esercizio → 31/12 dell'anno
    db.exec(`UPDATE parametri_anno SET data_chiusura = printf('%04d-12-31', anno)
      WHERE data_chiusura IS NULL OR TRIM(data_chiusura) = ''
         OR substr(data_chiusura, 1, 4) <> printf('%04d', anno)
         OR date(data_chiusura) IS NULL`);
    // un cliente senza nessun esercizio riceve quello dell'anno base
    db.exec(`INSERT OR IGNORE INTO parametri_anno (cliente_id, anno)
      SELECT id, anno_base FROM clienti
      WHERE id NOT IN (SELECT cliente_id FROM parametri_anno)`);
    // l'anno base deve essere uno degli esercizi del cliente (con riga parametri o con dati): altrimenti diventa il primo esercizio
    const anniCliente = `SELECT anno FROM parametri_anno WHERE cliente_id = clienti.id
      UNION SELECT anno FROM vendite WHERE cliente_id = clienti.id
      UNION SELECT v.anno FROM valori v JOIN voci x ON x.id = v.voce_id WHERE x.cliente_id = clienti.id`;
    db.exec(`UPDATE clienti SET anno_base = (SELECT MIN(anno) FROM (${anniCliente}))
      WHERE anno_base NOT IN (${anniCliente})`);
  },
];

const VERSIONE = MIGRAZIONI.length;

function versione(db) {
  const r = db.exec("PRAGMA user_version");
  return r.length ? Number(r[0].values[0][0]) : 0;
}

/* true se il database ha migrazioni ancora da eseguire */
const daMigrare = (db) => versione(db) < VERSIONE;

function migra(db) {
  const da = versione(db);
  if (da >= VERSIONE) return 0;
  db.exec("BEGIN");
  try {
    for (let i = da; i < VERSIONE; i++) MIGRAZIONI[i](db);
    db.exec(`PRAGMA user_version = ${VERSIONE}`);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw new Error(
      `Aggiornamento del database non riuscito (migrazione ${da + 1}…${VERSIONE}): ${e.message}`,
    );
  }
  return VERSIONE - da;
}

module.exports = { migra, daMigrare, versione, VERSIONE };
