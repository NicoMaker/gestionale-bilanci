/* PUT /clienti/:id/cashflow — imposta o cancella l'importo di una voce di cash flow in un mese. */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, toYear, toMonth, toNum } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");
const { getVoce } = require("../../voci/service");

const router = express.Router();

router.put(
  "/clienti/:id/cashflow",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const v = getVoce(toId(req.body.voce_id));
    if (v.cliente_id !== c.id || v.ambito !== "CF")
      throw new HttpError(403, "Voce non valida");
    const anno = toYear(req.body.anno),
      mese = toMonth(req.body.mese);
    const imp = toNum(req.body.importo);
    if (imp === null)
      db.run("DELETE FROM cashflow WHERE voce_id=? AND anno=? AND mese=?", [
        v.id,
        anno,
        mese,
      ]);
    else
      db.run(
        "INSERT INTO cashflow (voce_id, anno, mese, importo) VALUES (?,?,?,?) ON CONFLICT(voce_id, anno, mese) DO UPDATE SET importo=excluded.importo",
        [v.id, anno, mese, imp],
      );
    res.json({ ok: true });
  }),
);

module.exports = router;
