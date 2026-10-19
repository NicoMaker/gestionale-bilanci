/* GET /clienti/:id — dettaglio di un cliente. */
const express = require("express");
const { wrap } = require("../../../core/http");
const { toId } = require("../../../core/validators");
const { getCliente } = require("../service");

const router = express.Router();

router.get(
  "/clienti/:id",
  wrap((req, res) => res.json(getCliente(toId(req.params.id)))),
);

module.exports = router;
