/* POST /demo/clienti — carica i 20 clienti demo completi (aggiunge solo quelli mancanti). */
const express = require("express");
const { wrap } = require("../../../core/http");
const { eseguiSeed } = require("../../../../scripts/seed/esegui");

const router = express.Router();

router.post(
  "/demo/clienti",
  wrap((req, res) => {
    const r = eseguiSeed({ insieme: "completi" });
    res.status(201).json({
      creati: r.righe.length,
      giaPresenti: r.saltati,
      totale: r.disponibili,
    });
  }),
);

module.exports = router;
