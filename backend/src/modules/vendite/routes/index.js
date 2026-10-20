/* Vendite mensili per anno. */
const express = require("express");

const router = express.Router();

router.use(require("./put-vendita"));
router.use(require("./azzera-vendite"));

module.exports = router;
