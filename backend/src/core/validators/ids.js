/* Validazione di identificatori, anni e mesi. */
const { HttpError } = require("../http");

const toId = (v) => {
  const x = Number(v);
  if (!Number.isInteger(x) || x <= 0) throw new HttpError(400, "ID non valido");
  return x;
};
const toYear = (v) => {
  const x = Number(v);
  if (!Number.isInteger(x) || x < 1900 || x > 2200)
    throw new HttpError(400, "Anno non valido");
  return x;
};
const toMonth = (v) => {
  const x = Number(v);
  if (!Number.isInteger(x) || x < 1 || x > 12)
    throw new HttpError(400, "Mese non valido");
  return x;
};

module.exports = { toId, toYear, toMonth };
