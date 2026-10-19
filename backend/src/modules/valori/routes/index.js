/* Valori del bilancio (S.P. / C.E.) per voce e anno. */
const express = require("express");

const router = express.Router();

router.use(require("./put-valore"));

module.exports = router;
