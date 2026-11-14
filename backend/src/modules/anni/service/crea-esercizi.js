/* Creazione di più esercizi in un colpo, per uno o più clienti. Chi ha già un anno lo mantiene com'è (viene saltato).
   Va chiamata fuori da altre transazioni: ne apre una sua (tutto o niente). */
const db = require("../../../core/db");

/* clienti: righe cliente · anni: [2022, 2023…] · dataPer: (anno, idCliente) → «AAAA-MM-GG»
   → [{ id, ragione_sociale, creati: [anni], saltati: [anni], date: {anno: data} }] */
function creaEsercizi(clienti, anni, dataPer) {
  return db.tx(() =>
    clienti.map((c) => {
      const presenti = new Set(
        db
          .all("SELECT anno FROM parametri_anno WHERE cliente_id=?", [c.id])
          .map((r) => r.anno),
      );
      const creati = [];
      const saltati = [];
      const date = {};
      for (const anno of anni) {
        if (presenti.has(anno)) {
          saltati.push(anno);
          continue;
        }
        date[anno] = dataPer(anno, c.id);
        db.run(
          "INSERT INTO parametri_anno (cliente_id, anno, data_chiusura) VALUES (?,?,?)",
          [c.id, anno, date[anno]],
        );
        creati.push(anno);
      }
      return {
        id: c.id,
        ragione_sociale: c.ragione_sociale,
        creati,
        saltati,
        date, // data di chiusura scelta per ogni esercizio creato
        creato: creati.length > 0, // con un solo anno: true se l'esercizio è stato creato
      };
    }),
  );
}

module.exports = { creaEsercizi };
