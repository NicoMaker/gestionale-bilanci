/* Cestino: ogni eliminazione / azzeramento salva una copia dei dati per 15 giorni, poi viene cancellata definitivamente. */
const db = require("../../../core/db");

const GIORNI = 15;
const MS_GIORNO = 24 * 60 * 60 * 1000;

const ph = (arr) => (arr.length ? arr.map(() => "?").join(",") : "NULL");
const conta = (snap) =>
  ["valori", "budget_var", "cashflow", "vendite"].reduce(
    (n, k) => n + (snap[k] ? snap[k].length : 0),
    0,
  );

/* ── copie dei dati (snapshot) ── */
function snapVoci(ids) {
  const q = (t, col = "voce_id") =>
    db.all(`SELECT * FROM ${t} WHERE ${col} IN (${ph(ids)})`, ids);
  return {
    voci: q("voci", "id"),
    valori: q("valori"),
    budget_var: q("budget_var"),
    cashflow: q("cashflow"),
  };
}

function snapCliente(c) {
  const ids = db
    .all("SELECT id FROM voci WHERE cliente_id=?", [c.id])
    .map((r) => r.id);
  return Object.assign(
    {
      clienti: [db.one("SELECT * FROM clienti WHERE id=?", [c.id])],
      parametri_anno: db.all("SELECT * FROM parametri_anno WHERE cliente_id=?", [c.id]),
      vendite: db.all("SELECT * FROM vendite WHERE cliente_id=?", [c.id]),
    },
    snapVoci(ids),
  );
}

function snapAnno(cid, anno) {
  const ids = db
    .all("SELECT id FROM voci WHERE cliente_id=?", [cid])
    .map((r) => r.id);
  const q = (t) =>
    db.all(`SELECT * FROM ${t} WHERE anno=? AND voce_id IN (${ph(ids)})`, [
      anno,
      ...ids,
    ]);
  return {
    parametri_anno: db.all(
      "SELECT * FROM parametri_anno WHERE cliente_id=? AND anno=?",
      [cid, anno],
    ),
    vendite: db.all("SELECT * FROM vendite WHERE cliente_id=? AND anno=?", [
      cid,
      anno,
    ]),
    valori: q("valori"),
    budget_var: q("budget_var"),
    cashflow: q("cashflow"),
  };
}

/* ── gestione ── */
const iso = (d) => d.toISOString();

function sposta({ tipo, cliente, etichetta, dettaglio, snapshot }) {
  const ora = new Date();
  return db.insert(
    `INSERT INTO cestino (tipo, cliente_id, cliente_nome, etichetta, dettaglio, n_dati, dati_json, data_eliminazione, scade_il)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      tipo,
      cliente ? cliente.id : null,
      cliente ? cliente.ragione_sociale : null,
      etichetta,
      dettaglio || "",
      conta(snapshot),
      JSON.stringify(snapshot),
      iso(ora),
      iso(new Date(ora.getTime() + GIORNI * MS_GIORNO)),
    ],
  );
}

function elimina(ids) {
  db.run(`DELETE FROM cestino WHERE id IN (${ph(ids)})`, ids);
}

function svuota() {
  const n = db.one("SELECT COUNT(*) AS n FROM cestino").n;
  db.run("DELETE FROM cestino");
  return n;
}

// elimina definitivamente gli elementi scaduti; restituisce quanti
function eliminaScaduti() {
  const adesso = iso(new Date());
  const n = db.one("SELECT COUNT(*) AS n FROM cestino WHERE scade_il <= ?", [
    adesso,
  ]).n;
  if (n) db.run("DELETE FROM cestino WHERE scade_il <= ?", [adesso]);
  return n;
}

function elenco() {
  eliminaScaduti();
  const adesso = Date.now();
  return db
    .all(
      `SELECT id, tipo, cliente_id, cliente_nome, etichetta, dettaglio, n_dati, data_eliminazione, scade_il
       FROM cestino ORDER BY data_eliminazione DESC, id DESC`,
    )
    .map((r) => ({
      ...r,
      giorni_rimasti: Math.max(
        0,
        Math.ceil((new Date(r.scade_il).getTime() - adesso) / MS_GIORNO),
      ),
    }));
}

const conteggio = () => {
  eliminaScaduti();
  return db.one("SELECT COUNT(*) AS n FROM cestino").n;
};

const leggi = (id) => {
  const r = db.one("SELECT * FROM cestino WHERE id=?", [id]);
  return r ? { ...r, dati: JSON.parse(r.dati_json) } : null;
};

module.exports = {
  GIORNI,
  sposta,
  elimina,
  svuota,
  eliminaScaduti,
  elenco,
  conteggio,
  leggi,
  snapVoci,
  snapCliente,
  snapAnno,
};
