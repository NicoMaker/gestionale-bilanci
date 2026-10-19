/* Legge una riga di conto (404 se non esiste). */
const db = require("../../../core/db");
const { HttpError } = require("../../../core/http");

function getVoce(id) {
  const v = db.one("SELECT * FROM voci WHERE id = ?", [id]);
  if (!v) throw new HttpError(404, "Voce non trovata");
  return v;
}

module.exports = { getVoce };
