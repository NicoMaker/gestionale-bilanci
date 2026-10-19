/* POST /clienti/:id/anni — aggiunge un esercizio (l'anno successivo se non indicato). */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");
const { toId, toYear } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");

const router = express.Router();

router.post(
  "/clienti/:id/anni",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    let anno = req.body.anno;
    if (anno === undefined || anno === null || anno === "") {
      anno =
        db.one("SELECT MAX(anno) AS m FROM parametri_anno WHERE cliente_id=?", [
          c.id,
        ]).m + 1;
    }
    anno = toYear(anno);
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
      [c.id, anno],
    );
    res.status(201).json({ anno });
  }),
);

module.exports = router;
