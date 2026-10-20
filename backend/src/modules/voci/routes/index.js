/* Righe di conto: aggiunta, modifica ed eliminazione. */
const express = require("express");

const router = express.Router();

router.use(require("./create"));
router.use(require("./update"));
router.use(require("./remove"));
router.use(require("./bulk"));

module.exports = router;
