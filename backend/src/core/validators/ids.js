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

/* Data di chiusura dell'esercizio: AAAA-MM-GG, nell'anno indicato. Se manca è il 31/12 dell'anno.
   Accetta anche GG/MM/AAAA. */
const toDataChiusura = (v, anno) => {
  if (v === undefined || v === null || String(v).trim() === "")
    return `${anno}-12-31`;
  let s = String(v).trim();
  const it = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (it) s = `${it[3]}-${it[2].padStart(2, "0")}-${it[1].padStart(2, "0")}`;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (
    !m ||
    d.getUTCFullYear() !== +m[1] ||
    d.getUTCMonth() !== +m[2] - 1 ||
    d.getUTCDate() !== +m[3]
  )
    throw new HttpError(400, "Data non valida");
  if (+m[1] !== Number(anno))
    throw new HttpError(400, `La data deve essere nel ${anno}`);
  return s;
};

/* Elenco di id (senza duplicati, da 1 a max elementi). */
const toIds = (v, max = 1000, cosa = "cliente") => {
  if (!Array.isArray(v) || !v.length)
    throw new HttpError(400, `Seleziona almeno un ${cosa}`);
  if (v.length > max) throw new HttpError(400, `Troppi elementi selezionati`);
  return [...new Set(v.map(toId))];
};

module.exports = { toId, toIds, toYear, toMonth, toDataChiusura };
