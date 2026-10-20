/* POST /clienti — nuovo cliente con struttura iniziale del bilancio e gli esercizi fino all'ultimo anno chiuso. */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toYear, clean } = require("../../../core/validators");
const { getCliente, validaCliente } = require("../service");
const { seedCliente } = require("../seed");
const { sincronizzaCliente } = require("../../anni/service");

const router = express.Router();

router.post(
  "/clienti",
  wrap((req, res) => {
    const { ragione, piva } = validaCliente(req.body, 0);
    const anno = toYear(req.body.anno_base);
    if (anno < 1990 || anno > 2100)
      throw new HttpError(400, "Anno impostato non valido (1990–2100)");
    const id = db.tx(() => {
      const cid = db.insert(
        "INSERT INTO clienti (ragione_sociale, partita_iva, note, anno_base) VALUES (?,?,?,?)",
        [ragione, piva, clean(req.body.note, 2000), anno],
      );
      seedCliente(cid, anno);
      // esercizi automatici: dall'anno impostato fino all'ultimo esercizio chiuso
      sincronizzaCliente({ id: cid, anno_base: anno, anno_sync: null });
      return cid;
    });
    res.status(201).json(getCliente(id));
  }),
);

module.exports = router;
