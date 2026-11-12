/* POST /clienti/:id/anni — aggiunge un esercizio (l'anno successivo se non indicato).
   data_chiusura (facoltativa): se manca l'esercizio chiude il 31/12 dell'anno. */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");
const { toId, toYear, toDataChiusura } = require("../../../core/validators");
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
    const dataChiusura = toDataChiusura(req.body.data_chiusura, anno);
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno, data_chiusura) VALUES (?,?,?)",
      [c.id, anno, dataChiusura],
    );
    const salvata = db.one(
      "SELECT data_chiusura FROM parametri_anno WHERE cliente_id=? AND anno=?",
      [c.id, anno],
    ).data_chiusura;
    res.status(201).json({ anno, data_chiusura: salvata });
  }),
);

module.exports = router;
