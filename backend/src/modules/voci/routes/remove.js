/* DELETE /voci/:id — elimina una riga (e i suoi valori). */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId } = require("../../../core/validators");
const { getVoce } = require("../service");

const router = express.Router();

router.delete(
  "/voci/:id",
  wrap((req, res) => {
    const v = getVoce(toId(req.params.id));
    if (v.fissa)
      throw new HttpError(400, "Questa riga non può essere eliminata");
    db.tx(() => {
      db.run("DELETE FROM valori WHERE voce_id=?", [v.id]);
      db.run("DELETE FROM budget_var WHERE voce_id=?", [v.id]);
      db.run("DELETE FROM cashflow WHERE voce_id=?", [v.id]);
      db.run("DELETE FROM voci WHERE id=?", [v.id]);
    });
    res.json({ ok: true });
  }),
);

module.exports = router;
