/* GET /clienti/:id/dataset */
const express = require("express");
const { wrap } = require("../../../core/http");
const { toId } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");
const { loadRaw } = require("../service");

const router = express.Router();

router.get(
  "/clienti/:id/dataset",
  wrap((req, res) => {
    getCliente(toId(req.params.id));
    res.json(loadRaw(toId(req.params.id)));
  }),
);

module.exports = router;
