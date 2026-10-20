/* Eliminazione completa di un cliente e di tutti i suoi dati. Da chiamare dentro db.tx(). */
const db = require("../../../core/db");

function eliminaCliente(id) {
  // eliminazione esplicita (non ci affidiamo solo al CASCADE)
  const sub = "SELECT id FROM voci WHERE cliente_id=?";
  db.run(`DELETE FROM valori WHERE voce_id IN (${sub})`, [id]);
  db.run(`DELETE FROM budget_var WHERE voce_id IN (${sub})`, [id]);
  db.run(`DELETE FROM cashflow WHERE voce_id IN (${sub})`, [id]);
  db.run("DELETE FROM voci WHERE cliente_id=?", [id]);
  db.run("DELETE FROM vendite WHERE cliente_id=?", [id]);
  db.run("DELETE FROM parametri_anno WHERE cliente_id=?", [id]);
  db.run("DELETE FROM clienti WHERE id=?", [id]);
}

module.exports = { eliminaCliente };
