/* Esercizi (anni) di un cliente: aggiunta, conteggio dati, eliminazione. */
const express = require("express");

const router = express.Router();

router.use(require("./create"));
router.use(require("./dati"));
router.use(require("./remove"));

module.exports = router;
