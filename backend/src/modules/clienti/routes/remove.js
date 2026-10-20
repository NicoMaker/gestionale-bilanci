/* DELETE /clienti/:id — eliminazione; con dati richiede conferma digitando la ragione sociale (409 altrimenti). */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");
const { toId, norm } = require("../../../core/validators");
const { getCliente, datiCliente, eliminaCliente } = require("../service");

const router = express.Router();

// Cliente senza dati → eliminazione diretta. Cliente con dati → serve ?conferma=<ragione sociale esatta>.
router.delete(
  "/clienti/:id",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const d = datiCliente(c.id);
    if (d.ha_dati && norm(req.query.conferma) !== norm(c.ragione_sociale)) {
      return res.status(409).json({
        error:
          "Il cliente contiene dati: per eliminarlo conferma digitando la ragione sociale",
        richiede_conferma: true,
        dati: d,
      });
    }
    db.tx(() => eliminaCliente(c.id));
    res.json({ ok: true });
  }),
);

module.exports = router;
