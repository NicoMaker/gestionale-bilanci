/* Validazione e normalizzazione dei parametri in ingresso. */
const { toId, toYear, toMonth } = require("./ids");
const { toNum } = require("./numbers");
const { clean, norm } = require("./text");

module.exports = { toId, toYear, toMonth, toNum, clean, norm };
