/* PUT /clienti/:id — modifica anagrafica. */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");
const { toId, clean } = require("../../../core/validators");
const { getCliente, validaCliente } = require("../service");

const router = express.Router();

router.put(
  "/clienti/:id",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const { ragione, piva } = validaCliente(
      {
        ragione_sociale: req.body.ragione_sociale ?? c.ragione_sociale,
        partita_iva: req.body.partita_iva ?? c.partita_iva,
      },
      c.id,
    );
    db.run(
      "UPDATE clienti SET ragione_sociale=?, partita_iva=?, note=? WHERE id=?",
      [ragione, piva, clean(req.body.note ?? c.note, 2000), c.id],
    );
    res.json(getCliente(c.id));
  }),
);

module.exports = router;
