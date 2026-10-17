/* Assembla le API: ogni cartella di modules/ è una funzionalità indipendente. */
const express = require("express");
const { notFound, errorHandler } = require("../core/http");

const router = express.Router();

[
  "health/health.routes",
  "clienti/clienti.routes",
  "dataset/dataset.routes",
  "anni/anni.routes",
  "voci/voci.routes",
  "valori/valori.routes",
  "budget/budget.routes",
  "vendite/vendite.routes",
  "cashflow/cashflow.routes",
  "parametri/parametri.routes",
  "demo/demo.routes",
  "database/database.routes",
].forEach((m) => router.use(require("./" + m)));

router.use(notFound);
router.use(errorHandler);

module.exports = router;
