/* DELETE /clienti/:id/anni/:anno — elimina l'esercizio (con dati richiede ?conferma=1). */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, toYear } = require("../../../core/validators");
const { getCliente, datiCliente } = require("../../clienti/service");
const { anniCliente, eliminaEsercizio } = require("../service/elimina");

const router = express.Router();

router.delete(
  "/clienti/:id/anni/:anno",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.params.anno);
    const esiste = db.one(
      "SELECT 1 AS x FROM parametri_anno WHERE cliente_id=? AND anno=?",
      [c.id, anno],
    );
    const dAnno = datiCliente(c.id).anni.find((a) => a.anno === anno);
    if (!esiste && !(dAnno && dAnno.totale))
      throw new HttpError(404, "Anno non presente per questo cliente");
    if (anniCliente(c.id).size <= 1)
      throw new HttpError(400, "Il cliente deve avere almeno un anno");
    if (dAnno && dAnno.totale && String(req.query.conferma) !== "1") {
      return res.status(409).json({
        error: "L'anno contiene dati: conferma l'eliminazione",
        richiede_conferma: true,
        dati: dAnno,
      });
    }
    db.tx(() => eliminaEsercizio(c, anno, dAnno));
    res.json({ ok: true });
  }),
);

module.exports = router;
