/* Validazione degli importi: vuoto → null, altrimenti numero finito entro limiti ragionevoli. */
const { HttpError } = require("../http");

const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const x = Number(v);
  if (!isFinite(x) || Math.abs(x) > 1e13)
    throw new HttpError(400, "Numero non valido");
  return x;
};

module.exports = { toNum };
