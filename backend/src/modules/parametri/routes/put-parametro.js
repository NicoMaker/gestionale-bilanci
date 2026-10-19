/* PUT /clienti/:id/parametri — imposta un parametro annuale (vuoto = valore di default). */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, toYear, toNum } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");
const { CAMPI_PARAM } = require("./campi");

const router = express.Router();

router.put(
  "/clienti/:id/parametri",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.body.anno);
    const campo = String(req.body.campo);
    if (!CAMPI_PARAM.includes(campo))
      throw new HttpError(400, "Parametro non valido");
    const val = toNum(req.body.valore);
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
      [c.id, anno],
    );
    db.run(
      `UPDATE parametri_anno SET ${campo}=? WHERE cliente_id=? AND anno=?`,
      [val === null ? (campo === "peso_vendite" ? 1 : 0) : val, c.id, anno],
    );
    res.json({ ok: true });
  }),
);

module.exports = router;
