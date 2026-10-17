/* Dataset completo di un cliente (tutti gli anni) usato dal frontend per i calcoli. */
const express = require("express");
const { wrap } = require("../../core/http");
const { toId } = require("../../core/validators");
const { getCliente } = require("../clienti/clienti.service");
const { loadRaw } = require("./dataset.service");

const router = express.Router();

router.get(
  "/clienti/:id/dataset",
  wrap((req, res) => {
    getCliente(toId(req.params.id));
    res.json(loadRaw(toId(req.params.id)));
  }),
);

module.exports = router;
