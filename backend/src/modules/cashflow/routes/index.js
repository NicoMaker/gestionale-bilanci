/* Cash flow mensile per voce e anno. */
const express = require("express");

const router = express.Router();

router.use(require("./put-cashflow"));

module.exports = router;
