/* Assembla le API: ogni cartella di modules/ è una funzionalità indipendente. */
const express = require("express");
const { notFound, errorHandler } = require("../core/http");
const { autoSync } = require("./anni/service");

const router = express.Router();

// aggiorna automaticamente gli esercizi di ogni cliente quando cambia l'anno
router.use(autoSync);

[
  "health/routes",
  "statistiche/routes",
  "clienti/routes",
  "dataset/routes",
  "anni/routes",
  "voci/routes",
  "valori/routes",
  "budget/routes",
  "vendite/routes",
  "cashflow/routes",
  "parametri/routes",
  "demo/routes",
  "database/routes",
].forEach((m) => router.use(require("./" + m)));

router.use(notFound);
router.use(errorHandler);

module.exports = router;
