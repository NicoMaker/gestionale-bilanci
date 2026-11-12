/* POST /anni/bulk — crea l'esercizio di un anno per più clienti (salta chi ce l'ha già).
   data_chiusura (facoltativa): se manca l'esercizio chiude il 31/12 dell'anno. */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toIds, toYear, toDataChiusura } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");

const router = express.Router();

router.post(
  "/anni/bulk",
  wrap((req, res) => {
    const anno = toYear(req.body.anno);
    if (anno < 1990 || anno > 2100)
      throw new HttpError(400, "Anno non valido (1990–2100)");
    const dataChiusura = toDataChiusura(req.body.data_chiusura, anno);
    const clienti = toIds(req.body.cliente_ids).map(getCliente); // 404 se uno non esiste
    const dettaglio = db.tx(() =>
      clienti.map((c) => {
        const gia = db.one(
          "SELECT 1 AS x FROM parametri_anno WHERE cliente_id=? AND anno=?",
          [c.id, anno],
        );
        if (!gia)
          db.run(
            "INSERT INTO parametri_anno (cliente_id, anno, data_chiusura) VALUES (?,?,?)",
            [c.id, anno, dataChiusura],
          );
        return {
          id: c.id,
          ragione_sociale: c.ragione_sociale,
          creato: !gia,
        };
      }),
    );
    const creati = dettaglio.filter((d) => d.creato).length;
    res.status(201).json({
      anno,
      data_chiusura: dataChiusura,
      creati,
      saltati: dettaglio.length - creati,
      dettaglio,
    });
  }),
);

module.exports = router;
