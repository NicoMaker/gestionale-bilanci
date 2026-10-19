/* Parametri annuali (inflazione, produttività, investimento, saldo iniziale…). */
const express = require("express");

const router = express.Router();

router.use(require("./put-parametro"));

module.exports = router;
