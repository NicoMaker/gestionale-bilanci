/* Validazione di ragione sociale e partita IVA (obbligatorietà, formato, unicità). */
const db = require("../../../core/db");
const { HttpError } = require("../../../core/http");
const { clean, norm } = require("../../../core/validators");

function validaCliente(body, idEsistente) {
  const ragione = clean(body.ragione_sociale);
  if (!ragione) throw new HttpError(400, "La ragione sociale è obbligatoria");
  const piva = clean(body.partita_iva, 30).replace(/\s/g, "");
  if (piva && !/^\d{11}$/.test(piva))
    throw new HttpError(400, "Partita IVA non valida: servono 11 cifre");
  const altri = db.all(
    "SELECT id, ragione_sociale, partita_iva FROM clienti WHERE id <> ?",
    [idEsistente || 0],
  );
  if (altri.some((c) => norm(c.ragione_sociale) === norm(ragione)))
    throw new HttpError(
      409,
      "Esiste già un cliente con questa ragione sociale",
    );
  if (piva && altri.some((c) => (c.partita_iva || "") === piva))
    throw new HttpError(409, "Esiste già un cliente con questa Partita IVA");
  return { ragione, piva };
}

module.exports = { validaCliente };
