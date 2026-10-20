/* Anagrafica clienti: elenco, creazione, modifica, eliminazione singola e multipla (con conferma se ci sono dati). */
const express = require("express");

const router = express.Router();

router.use(require("./list"));
router.use(require("./create"));
router.use(require("./get"));
router.use(require("./update"));
router.use(require("./dati"));
router.use(require("./remove"));
router.use(require("./remove-bulk"));

module.exports = router;
