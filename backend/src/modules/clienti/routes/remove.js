/* DELETE /clienti/:id — eliminazione; con dati richiede conferma digitando la ragione sociale (409 altrimenti). */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");
const { toId, norm } = require("../../../core/validators");
const { getCliente, datiCliente } = require("../service");

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
    db.tx(() => {
      // eliminazione esplicita (non ci affidiamo solo al CASCADE)
      db.run(
        "DELETE FROM valori WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)",
        [c.id],
      );
      db.run(
        "DELETE FROM budget_var WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)",
        [c.id],
      );
      db.run(
        "DELETE FROM cashflow WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)",
        [c.id],
      );
      db.run("DELETE FROM voci WHERE cliente_id=?", [c.id]);
      db.run("DELETE FROM vendite WHERE cliente_id=?", [c.id]);
      db.run("DELETE FROM parametri_anno WHERE cliente_id=?", [c.id]);
      db.run("DELETE FROM clienti WHERE id=?", [c.id]);
    });
    res.json({ ok: true });
  }),
);

module.exports = router;
