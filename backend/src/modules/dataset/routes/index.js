/* Dataset completo di un cliente (tutti gli anni) usato dal frontend per i calcoli. */
const express = require("express");

const router = express.Router();

router.use(require("./get-dataset"));

module.exports = router;
