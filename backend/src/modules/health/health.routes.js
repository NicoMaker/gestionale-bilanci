/* GET /api/health — verifica che il server risponda. */
const express = require("express");

const router = express.Router();

router.get("/health", (req, res) =>
  res.json({ ok: true, time: new Date().toISOString() }),
);

module.exports = router;
