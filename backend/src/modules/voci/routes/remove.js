/* DELETE /voci/:id — elimina una riga (e i suoi valori). */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");
const { toId } = require("../../../core/validators");
const { getVoce } = require("../service");
const C = require("../../cestino/service");

const router = express.Router();

router.delete(
  "/voci/:id",
  wrap((req, res) => {
    const v = getVoce(toId(req.params.id));
    db.tx(() => {
      const c = db.one("SELECT * FROM clienti WHERE id=?", [v.cliente_id]);
      C.sposta({
        tipo: "voci",
        cliente: c,
        ...C.etichettaVoci([v]),
        snapshot: C.snapVoci([v.id]),
      });
      db.run("DELETE FROM valori WHERE voce_id=?", [v.id]);
      db.run("DELETE FROM budget_var WHERE voce_id=?", [v.id]);
      db.run("DELETE FROM cashflow WHERE voce_id=?", [v.id]);
      db.run("DELETE FROM voci WHERE id=?", [v.id]);
    });
    res.json({ ok: true });
  }),
);

module.exports = router;
