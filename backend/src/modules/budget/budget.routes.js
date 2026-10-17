/* Variazioni manuali del budget per voce e anno. */
const express = require("express");
const db = require("../../core/db");
const { HttpError, wrap } = require("../../core/http");
const { toId, toYear, toMonth, toNum } = require("../../core/validators");
const { getCliente } = require("../clienti/clienti.service");
const { getVoce } = require("../voci/voci.service");

const router = express.Router();

router.put(
  "/clienti/:id/budget-var",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const v = getVoce(toId(req.body.voce_id));
    if (v.cliente_id !== c.id)
      throw new HttpError(403, "Voce di un altro cliente");
    const anno = toYear(req.body.anno);
    const val = toNum(req.body.valore);
    if (val === null)
      db.run("DELETE FROM budget_var WHERE voce_id=? AND anno=?", [v.id, anno]);
    else
      db.run(
        "INSERT INTO budget_var (voce_id, anno, valore) VALUES (?,?,?) ON CONFLICT(voce_id, anno) DO UPDATE SET valore=excluded.valore",
        [v.id, anno, val],
      );
    res.json({ ok: true });
  }),
);

module.exports = router;
