/* Crea per un nuovo cliente la struttura di partenza (sezioni, voci predefinite, anno base). */
const db = require("./db");
const Template = require("../../shared/template.js");

function seedCliente(clienteId, annoBase) {
  for (const ambito of Object.keys(Template.SEZIONI)) {
    for (const s of Template.SEZIONI[ambito]) {
      s.def.forEach((descr, i) => {
        db.run(
          "INSERT INTO voci (cliente_id, ambito, sezione, codice, descrizione, tipo, ordine, fissa) VALUES (?,?,?,?,?,?,?,?)",
          [clienteId, ambito, s.id, "", descr, ambito === "CE" ? s.tipo || "" : "", i + 1, s.single ? 1 : 0]
        );
      });
    }
  }
  db.run("INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)", [clienteId, annoBase]);
}

module.exports = { seedCliente };
