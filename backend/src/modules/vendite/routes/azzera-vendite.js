/* POST /clienti/:id/vendite/azzera — cancella le vendite dei mesi e/o degli anni indicati.
   body: { mesi?: [1..12], anni?: [anno…] } (un elenco omesso significa «tutti») */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, toYear, toMonth } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");
const C = require("../../cestino/service");
const T = require("../../../../../shared/template");

const router = express.Router();

const lista = (v, conv) => {
  if (v === undefined || v === null) return null;
  if (!Array.isArray(v) || !v.length || v.length > 100)
    throw new HttpError(400, "Selezione non valida");
  return [...new Set(v.map(conv))];
};

router.post(
  "/clienti/:id/vendite/azzera",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const mesi = lista(req.body.mesi, toMonth);
    const anni = lista(req.body.anni, toYear);
    if (!mesi && !anni) throw new HttpError(400, "Seleziona mesi o anni");
    let sql = "DELETE FROM vendite WHERE cliente_id=?";
    const p = [c.id];
    if (mesi) {
      sql += ` AND mese IN (${mesi.map(() => "?").join(",")})`;
      p.push(...mesi);
    }
    if (anni) {
      sql += ` AND anno IN (${anni.map(() => "?").join(",")})`;
      p.push(...anni);
    }
    db.tx(() => {
      const cancellate = db.all(sql.replace("DELETE", "SELECT *"), p);
      if (cancellate.length)
        C.sposta({
          tipo: "azzera_vendite",
          cliente: c,
          etichetta:
            "Vendite azzerate" +
            (mesi
              ? ": " + mesi.map((m) => T.MESI_BREVI[m - 1]).join(", ")
              : "") +
            (anni ? " · esercizi " + anni.join(", ") : ""),
          dettaglio: `${cancellate.length} importi mensili`,
          snapshot: { vendite: cancellate },
        });
      db.run(sql, p);
    });
    res.json({ ok: true });
  }),
);

module.exports = router;
