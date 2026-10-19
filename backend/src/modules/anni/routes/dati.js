/* GET /clienti/:id/anni/:anno/dati — dati presenti nell'esercizio. */
const express = require("express");
const { wrap } = require("../../../core/http");
const { toId, toYear } = require("../../../core/validators");
const { getCliente, datiCliente } = require("../../clienti/service");

const router = express.Router();

router.get(
  "/clienti/:id/anni/:anno/dati",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.params.anno);
    const d = datiCliente(c.id).anni.find((a) => a.anno === anno) || {
      anno,
      valori: 0,
      vendite: 0,
      cashflow: 0,
      budget_var: 0,
      parametri: 0,
      totale: 0,
    };
    res.json(Object.assign({ ha_dati: d.totale > 0 }, d));
  }),
);

module.exports = router;
