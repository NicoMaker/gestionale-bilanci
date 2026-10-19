/* Lettura completa dei dati grezzi di un cliente (voci, valori, vendite, cash flow, parametri). */
const db = require("../../core/db");

function loadRaw(cid) {
  return {
    cliente: db.one("SELECT * FROM clienti WHERE id = ?", [cid]),
    parametri: db.all(
      "SELECT * FROM parametri_anno WHERE cliente_id=? ORDER BY anno",
      [cid],
    ),
    voci: db.all(
      "SELECT id, ambito, sezione, codice, descrizione, tipo, ordine, fissa FROM voci WHERE cliente_id=? ORDER BY ambito, sezione, ordine, id",
      [cid],
    ),
    valori: db.all(
      "SELECT v.voce_id, v.anno, v.importo FROM valori v JOIN voci x ON x.id=v.voce_id WHERE x.cliente_id=? AND v.importo IS NOT NULL",
      [cid],
    ),
    budget_var: db.all(
      "SELECT b.voce_id, b.anno, b.valore FROM budget_var b JOIN voci x ON x.id=b.voce_id WHERE x.cliente_id=? AND b.valore IS NOT NULL",
      [cid],
    ),
    vendite: db.all(
      "SELECT anno, mese, importo FROM vendite WHERE cliente_id=? AND importo IS NOT NULL",
      [cid],
    ),
    cashflow: db.all(
      "SELECT c.voce_id, c.anno, c.mese, c.importo FROM cashflow c JOIN voci x ON x.id=c.voce_id WHERE x.cliente_id=? AND c.importo IS NOT NULL",
      [cid],
    ),
  };
}

module.exports = { loadRaw };
