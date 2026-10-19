/* Crea l'anagrafica del cliente, la struttura di partenza (voci predefinite del template) e le righe parametri per ogni anno. */
const db = require("../../../src/core/db");
const Template = require("../../../shared/template");

function creaCliente({
  ragione_sociale,
  partita_iva = "",
  note = "",
  anno_base,
  anni,
}) {
  const cid = db.insert(
    "INSERT INTO clienti (ragione_sociale, partita_iva, note, anno_base) VALUES (?,?,?,?)",
    [ragione_sociale, partita_iva, note, anno_base],
  );
  for (const ambito of Object.keys(Template.SEZIONI)) {
    for (const s of Template.SEZIONI[ambito]) {
      s.def.forEach((descr, i) => {
        db.run(
          "INSERT INTO voci (cliente_id, ambito, sezione, codice, descrizione, tipo, ordine, fissa) VALUES (?,?,?,?,?,?,?,?)",
          [
            cid,
            ambito,
            s.id,
            "",
            descr,
            ambito === "CE" ? s.tipo || "" : "",
            i + 1,
            s.single ? 1 : 0,
          ],
        );
      });
    }
  }
  for (const a of anni)
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
      [cid, a],
    );
  return cid;
}

module.exports = { creaCliente };
