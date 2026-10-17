/* Logica dei clienti: lettura, validazione, conteggio dei dati inseriti. */
const db = require("../../core/db");
const { HttpError } = require("../../core/http");
const { clean, norm } = require("../../core/validators");

function getCliente(id) {
  const c = db.one("SELECT * FROM clienti WHERE id = ?", [id]);
  if (!c) throw new HttpError(404, "Cliente non trovato");
  return c;
}

/* ───────── verifiche sui dati presenti ───────── */
const PARAM_DEFAULT = {
  peso_vendite: 1,
  inflazione: 0,
  produttivita: 0,
  imposte_budget: 0,
  investimento: 0,
  aumento_utile: 0,
  saldo_iniziale_cf: 0,
};
// Quanti dati inseriti ha un cliente (per anno). "ha_dati" = esiste almeno un valore, una vendita, un cash flow, una variazione o un parametro modificato.
function datiCliente(cid) {
  const per = {};
  const slot = (a) =>
    (per[a] = per[a] || {
      anno: a,
      valori: 0,
      vendite: 0,
      cashflow: 0,
      budget_var: 0,
      parametri: 0,
    });
  db.all(
    "SELECT v.anno, COUNT(*) AS n FROM valori v JOIN voci x ON x.id=v.voce_id WHERE x.cliente_id=? AND v.importo IS NOT NULL GROUP BY v.anno",
    [cid],
  ).forEach((r) => (slot(r.anno).valori = r.n));
  db.all(
    "SELECT anno, COUNT(*) AS n FROM vendite WHERE cliente_id=? AND importo IS NOT NULL GROUP BY anno",
    [cid],
  ).forEach((r) => (slot(r.anno).vendite = r.n));
  db.all(
    "SELECT c.anno, COUNT(*) AS n FROM cashflow c JOIN voci x ON x.id=c.voce_id WHERE x.cliente_id=? AND c.importo IS NOT NULL GROUP BY c.anno",
    [cid],
  ).forEach((r) => (slot(r.anno).cashflow = r.n));
  db.all(
    "SELECT b.anno, COUNT(*) AS n FROM budget_var b JOIN voci x ON x.id=b.voce_id WHERE x.cliente_id=? AND b.valore IS NOT NULL GROUP BY b.anno",
    [cid],
  ).forEach((r) => (slot(r.anno).budget_var = r.n));
  db.all("SELECT * FROM parametri_anno WHERE cliente_id=?", [cid]).forEach(
    (p) => {
      const s = slot(p.anno);
      s.parametri = Object.keys(PARAM_DEFAULT).filter(
        (k) => Number(p[k]) !== PARAM_DEFAULT[k],
      ).length;
    },
  );
  const anni = Object.values(per).sort((a, b) => a.anno - b.anno);
  anni.forEach(
    (a) =>
      (a.totale =
        a.valori + a.vendite + a.cashflow + a.budget_var + a.parametri),
  );
  const totale = anni.reduce((s, a) => s + a.totale, 0);
  return { anni, totale, ha_dati: totale > 0 };
}

function validaCliente(body, idEsistente) {
  const ragione = clean(body.ragione_sociale);
  if (!ragione) throw new HttpError(400, "La ragione sociale è obbligatoria");
  const piva = clean(body.partita_iva, 30).replace(/\s/g, "");
  if (piva && !/^\d{11}$/.test(piva))
    throw new HttpError(400, "Partita IVA non valida: servono 11 cifre");
  const altri = db.all(
    "SELECT id, ragione_sociale, partita_iva FROM clienti WHERE id <> ?",
    [idEsistente || 0],
  );
  if (altri.some((c) => norm(c.ragione_sociale) === norm(ragione)))
    throw new HttpError(
      409,
      "Esiste già un cliente con questa ragione sociale",
    );
  if (piva && altri.some((c) => (c.partita_iva || "") === piva))
    throw new HttpError(409, "Esiste già un cliente con questa Partita IVA");
  return { ragione, piva };
}

module.exports = { getCliente, datiCliente, validaCliente, PARAM_DEFAULT };
