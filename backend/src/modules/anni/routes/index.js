/* Esercizi (anni) di un cliente: aggiunta (singola e multipla), data di chiusura, conteggio dati, eliminazione (singola e multipla). */
const express = require("express");

const router = express.Router();

router.use(require("./create"));
router.use(require("./create-bulk"));
router.use(require("./put-data-chiusura"));
router.use(require("./dati"));
router.use(require("./remove-bulk"));
router.use(require("./remove"));

module.exports = router;
