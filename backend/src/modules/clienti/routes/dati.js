/* GET /clienti/:id/dati — quanti dati contiene il cliente (per anno). */
const express = require("express");
const { wrap } = require("../../../core/http");
const { toId } = require("../../../core/validators");
const { getCliente, datiCliente } = require("../service");

const router = express.Router();

router.get(
  "/clienti/:id/dati",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    res.json(Object.assign({ cliente: c.ragione_sociale }, datiCliente(c.id)));
  }),
);

module.exports = router;
