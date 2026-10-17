/* Righe di conto (voci): lettura e verifica delle sezioni valide. */
const db = require("../../core/db");
const { HttpError } = require("../../core/http");
const Template = require("../../../shared/template.js");

function getVoce(id) {
  const v = db.one("SELECT * FROM voci WHERE id = ?", [id]);
  if (!v) throw new HttpError(404, "Voce non trovata");
  return v;
}
const sezioneValida = (ambito, sez) =>
  (Template.SEZIONI[ambito] || []).find((s) => s.id === sez);

module.exports = { getVoce, sezioneValida };
