/* GET /download-db — scarica il file del database SQLite come backup. */
const express = require("express");
const fs = require("fs");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");

const router = express.Router();

router.get(
  "/download-db",
  wrap((req, res) => {
    db.flush();
    const p = db.dbPath();
    if (!fs.existsSync(p))
      throw new HttpError(404, "File database non trovato");
    const stamp = new Date().toISOString().slice(0, 10);
    res.download(p, `gestionale-bilanci-${stamp}.db`);
  }),
);

module.exports = router;
