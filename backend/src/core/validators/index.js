/* Validazione e normalizzazione dei parametri in ingresso. */
const { toId, toIds, toYear, toMonth, toDataChiusura } = require("./ids");
const { toNum } = require("./numbers");
const { clean, norm } = require("./text");

module.exports = {
  toId,
  toIds,
  toYear,
  toMonth,
  toDataChiusura,
  toNum,
  clean,
  norm,
};
