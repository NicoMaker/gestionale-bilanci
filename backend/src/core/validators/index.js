/* Validazione e normalizzazione dei parametri in ingresso. */
const {
  toId,
  toIds,
  toYear,
  toMonth,
  toDataChiusura,
  toAnni,
  toDatePerAnno,
  toDateEsercizi,
  ANNO_MIN,
  ANNO_MAX,
} = require("./ids");
const { toNum } = require("./numbers");
const { clean, norm } = require("./text");

module.exports = {
  toId,
  toIds,
  toYear,
  toMonth,
  toDataChiusura,
  toAnni,
  toDatePerAnno,
  toDateEsercizi,
  ANNO_MIN,
  ANNO_MAX,
  toNum,
  clean,
  norm,
};
