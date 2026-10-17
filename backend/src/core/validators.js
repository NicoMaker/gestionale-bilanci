/* Validazione e normalizzazione dei parametri in ingresso. */
const { HttpError } = require("./http");

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
const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const x = Number(v);
  if (!isFinite(x) || Math.abs(x) > 1e13)
    throw new HttpError(400, "Numero non valido");
  return x;
};
const clean = (s, max = 200) =>
  String(s ?? "")
    .trim()
    .slice(0, max);
const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

module.exports = { toId, toYear, toMonth, toNum, clean, norm };
