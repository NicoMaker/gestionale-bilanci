/* PUT /clienti/:id/valore — imposta o cancella l'importo di una voce per un anno. */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, toYear, toNum } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");
const { getVoce } = require("../../voci/service");

const router = express.Router();

router.put(
  "/clienti/:id/valore",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const v = getVoce(toId(req.body.voce_id));
    if (v.cliente_id !== c.id)
      throw new HttpError(403, "Voce di un altro cliente");
    const anno = toYear(req.body.anno);
    const imp = toNum(req.body.importo);
    if (imp === null)
      db.run("DELETE FROM valori WHERE voce_id=? AND anno=?", [v.id, anno]);
    else
      db.run(
        "INSERT INTO valori (voce_id, anno, importo) VALUES (?,?,?) ON CONFLICT(voce_id, anno) DO UPDATE SET importo=excluded.importo",
        [v.id, anno, imp],
      );
    res.json({ ok: true });
  }),
);

module.exports = router;
