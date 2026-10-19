/* Vendite mensili per anno. */
const express = require("express");

const router = express.Router();

router.use(require("./put-vendita"));

module.exports = router;
