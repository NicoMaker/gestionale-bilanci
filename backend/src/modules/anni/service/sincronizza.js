/* Aggiornamento automatico degli esercizi: ogni cliente riceve un esercizio per ogni anno,
   dall'anno impostato alla creazione fino all'ultimo esercizio chiuso (anno corrente − 1).
   Si procede solo in avanti (da anno_sync + 1): un anno eliminato a mano non viene ricreato. */
const db = require("../../../core/db");

const annoCorrente = () => new Date().getFullYear();
const ultimoEsercizioChiuso = () => annoCorrente() - 1;

/* Crea gli esercizi mancanti di un cliente. Va chiamata dentro una transazione o da sola. */
function sincronizzaCliente(c, fino = ultimoEsercizioChiuso()) {
  const max = db.one(
    "SELECT MAX(anno) AS m FROM parametri_anno WHERE cliente_id=?",
    [c.id],
  ).m;
  const ultimo = c.anno_sync ?? Math.max(c.anno_base, max ?? c.anno_base);
  const creati = [];
  for (let a = ultimo + 1; a <= fino; a++) {
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
      [c.id, a],
    );
    creati.push(a);
  }
  const nuovo = Math.max(ultimo, fino);
  if (c.anno_sync !== nuovo)
    db.run("UPDATE clienti SET anno_sync=? WHERE id=?", [nuovo, c.id]);
  return creati;
}

/* Sincronizza tutti i clienti. Restituisce quanti esercizi sono stati creati. */
function sincronizzaTutti(fino = ultimoEsercizioChiuso()) {
  return db.tx(() =>
    db
      .all("SELECT id, anno_base, anno_sync FROM clienti")
      .reduce((n, c) => n + sincronizzaCliente(c, fino).length, 0),
  );
}

module.exports = {
  annoCorrente,
  ultimoEsercizioChiuso,
  sincronizzaCliente,
  sincronizzaTutti,
};
