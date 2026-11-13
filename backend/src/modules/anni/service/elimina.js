/* Eliminazione di esercizi (anni) di un cliente: logica condivisa dalla rotta singola e da quella multipla. */
const db = require("../../../core/db");
const { datiCliente } = require("../../clienti/service");
const C = require("../../cestino/service");

/* Anni del cliente: quelli con riga parametri + quelli con dati inseriti. */
function anniCliente(clienteId) {
  return new Set([
    ...db
      .all("SELECT anno FROM parametri_anno WHERE cliente_id=?", [clienteId])
      .map((r) => r.anno),
    ...datiCliente(clienteId)
      .anni.filter((a) => a.totale)
      .map((a) => a.anno),
  ]);
}

/* Sposta l'esercizio nel cestino e ne cancella i dati. Va chiamata dentro db.tx(). */
function eliminaEsercizio(c, anno, dAnno) {
  C.sposta({
    tipo: "anno",
    cliente: c,
    etichetta: `Esercizio ${anno}`,
    dettaglio:
      dAnno && dAnno.totale ? `${dAnno.totale} dati inseriti` : "senza dati",
    snapshot: Object.assign(C.snapAnno(c.id, anno), { anno }),
  });
  const sub = "SELECT id FROM voci WHERE cliente_id=?";
  db.run(`DELETE FROM valori WHERE anno=? AND voce_id IN (${sub})`, [
    anno,
    c.id,
  ]);
  db.run(`DELETE FROM budget_var WHERE anno=? AND voce_id IN (${sub})`, [
    anno,
    c.id,
  ]);
  db.run(`DELETE FROM cashflow WHERE anno=? AND voce_id IN (${sub})`, [
    anno,
    c.id,
  ]);
  db.run("DELETE FROM vendite WHERE cliente_id=? AND anno=?", [c.id, anno]);
  db.run("DELETE FROM parametri_anno WHERE cliente_id=? AND anno=?", [
    c.id,
    anno,
  ]);
}

module.exports = { anniCliente, eliminaEsercizio };
