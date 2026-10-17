/* Vendite mensili per anno. */
const express = require("express");
const db = require("../../core/db");
const { HttpError, wrap } = require("../../core/http");
const { toId, toYear, toMonth, toNum } = require("../../core/validators");
const { getCliente } = require("../clienti/clienti.service");

const router = express.Router();

router.put(
  "/clienti/:id/vendite",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.body.anno),
      mese = toMonth(req.body.mese);
    const imp = toNum(req.body.importo);
    if (imp === null)
      db.run("DELETE FROM vendite WHERE cliente_id=? AND anno=? AND mese=?", [
        c.id,
        anno,
        mese,
      ]);
    else
      db.run(
        "INSERT INTO vendite (cliente_id, anno, mese, importo) VALUES (?,?,?,?) ON CONFLICT(cliente_id, anno, mese) DO UPDATE SET importo=excluded.importo",
        [c.id, anno, mese, imp],
      );
    res.json({ ok: true });
  }),
);

module.exports = router;
