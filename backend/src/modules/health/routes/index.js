/* GET /api/health — verifica che il server risponda. */
const express = require("express");

const router = express.Router();

router.use(require("./get-health"));

module.exports = router;
