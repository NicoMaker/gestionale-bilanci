/* Quanti dati inseriti ha un cliente, per anno. "ha_dati" = esiste almeno un valore, una vendita, un cash flow, una variazione o un parametro modificato. */
const db = require("../../../core/db");
const { PARAM_DEFAULT } = require("./param-default");

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

module.exports = { datiCliente };
