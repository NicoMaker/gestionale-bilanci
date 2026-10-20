/* Logica degli esercizi: aggiornamento automatico. */
const sync = require("./sincronizza");
const { autoSync } = require("./auto-sync");

module.exports = Object.assign({ autoSync }, sync);
