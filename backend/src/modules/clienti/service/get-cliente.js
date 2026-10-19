/* Legge un cliente (404 se non esiste). */
const db = require("../../../core/db");
const { HttpError } = require("../../../core/http");

function getCliente(id) {
  const c = db.one("SELECT * FROM clienti WHERE id = ?", [id]);
  if (!c) throw new HttpError(404, "Cliente non trovato");
  return c;
}

module.exports = { getCliente };
