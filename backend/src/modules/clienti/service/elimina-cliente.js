/* Eliminazione completa di un cliente e di tutti i suoi dati. Da chiamare dentro db.tx(). */
const db = require("../../../core/db");
const C = require("../../cestino/service/cestino");

/* Elimina il cliente e tutti i suoi dati; prima ne salva una copia nel cestino (15 giorni), salvo { cestino: false }. */
function eliminaCliente(id, { cestino = true } = {}) {
  const c = db.one("SELECT * FROM clienti WHERE id=?", [id]);
  if (c && cestino) {
    const snapshot = C.snapCliente(c);
    const anni = new Set(snapshot.parametri_anno.map((p) => p.anno)).size;
    C.sposta({
      tipo: "cliente",
      cliente: c,
      etichetta: c.ragione_sociale,
      dettaglio:
        (c.partita_iva ? "P.IVA " + c.partita_iva + " · " : "") +
        `${anni} esercizi · ${snapshot.voci.length} righe`,
      snapshot,
    });
  }
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
