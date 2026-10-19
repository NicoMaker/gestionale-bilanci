/* Inserisce le voci predefinite del template (S.P., C.E., C.F.) per un cliente. */
const db = require("../../../core/db");
const Template = require("../../../../../shared/template");

function inserisciVociPredefinite(clienteId) {
  for (const ambito of Object.keys(Template.SEZIONI)) {
    for (const s of Template.SEZIONI[ambito]) {
      s.def.forEach((descr, i) => {
        db.run(
          "INSERT INTO voci (cliente_id, ambito, sezione, codice, descrizione, tipo, ordine, fissa) VALUES (?,?,?,?,?,?,?,?)",
          [
            clienteId,
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
}

module.exports = { inserisciVociPredefinite };
