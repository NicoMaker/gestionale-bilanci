/* Logica degli esercizi: aggiornamento automatico e creazione di più esercizi insieme. */
const sync = require("./sincronizza");
const { autoSync } = require("./auto-sync");
const { creaEsercizi } = require("./crea-esercizi");

module.exports = Object.assign({ autoSync, creaEsercizi }, sync);
