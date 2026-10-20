/* Esercizi (anni) di un cliente: aggiunta (singola e multipla), conteggio dati, eliminazione. */
const express = require("express");

const router = express.Router();

router.use(require("./create"));
router.use(require("./create-bulk"));
router.use(require("./dati"));
router.use(require("./remove"));

module.exports = router;
