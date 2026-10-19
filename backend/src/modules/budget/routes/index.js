/* Variazioni manuali del budget per voce e anno. */
const express = require("express");

const router = express.Router();

router.use(require("./put-budget-var"));

module.exports = router;
