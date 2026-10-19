/* Punto d'ingresso del database: connessione + query helper. Uso: const db = require("../core/db"). */
const { init, flush, dbPath } = require("./connection");
const { all, one, run, insert, tx } = require("./query");

module.exports = { init, all, one, run, insert, tx, flush, dbPath };
