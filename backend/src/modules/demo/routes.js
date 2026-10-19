/* Creazione del cliente demo con dati di esempio. */
const express = require("express");
const db = require("../../core/db");
const { HttpError, wrap } = require("../../core/http");

const router = express.Router();

router.post(
  "/demo",
  wrap((req, res) => {
    if (
      db.one(
        "SELECT id FROM clienti WHERE partita_iva='01234567890' OR ragione_sociale='Azienda Demo S.r.l.'",
      )
    ) {
      throw new HttpError(
        409,
        "Il cliente demo esiste già: eliminalo prima di ricrearlo",
      );
    }
    const { creaDemo } = require("./service");
    res.status(201).json(creaDemo());
  }),
);

module.exports = router;
