/* POST /clienti/:id/voci/elimina — elimina più righe insieme.
   POST /clienti/:id/voci/azzera — cancella i valori di più righe lasciando le righe al loro posto.
     body: { ids, cosa: "valori" | "cashflow" | "budget", anno? }  (anno: solo per cashflow e budget) */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, toIds, toYear } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");

const router = express.Router();

const marks = (ids) => ids.map(() => "?").join(",");

// verifica che tutte le righe indicate appartengano al cliente
function righeDelCliente(clienteId, ids) {
  const n = db.one(
    `SELECT COUNT(*) AS n FROM voci WHERE cliente_id=? AND id IN (${marks(ids)})`,
    [clienteId, ...ids],
  ).n;
  if (n !== ids.length) throw new HttpError(404, "Riga non trovata");
}

router.post(
  "/clienti/:id/voci/elimina",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const ids = toIds(req.body.ids, 2000, "elemento");
    righeDelCliente(c.id, ids);
    db.tx(() => {
      for (const t of ["valori", "budget_var", "cashflow"])
        db.run(`DELETE FROM ${t} WHERE voce_id IN (${marks(ids)})`, ids);
      db.run(`DELETE FROM voci WHERE id IN (${marks(ids)})`, ids);
    });
    res.json({ ok: true, eliminate: ids.length });
  }),
);

router.post(
  "/clienti/:id/voci/azzera",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const ids = toIds(req.body.ids, 2000, "elemento");
    righeDelCliente(c.id, ids);
    const tabella = { valori: "valori", cashflow: "cashflow", budget: "budget_var" }[
      req.body.cosa
    ];
    if (!tabella) throw new HttpError(400, "Tipo di dati non valido");
    if (tabella === "valori")
      db.run(`DELETE FROM valori WHERE voce_id IN (${marks(ids)})`, ids);
    else
      db.run(
        `DELETE FROM ${tabella} WHERE anno=? AND voce_id IN (${marks(ids)})`,
        [toYear(req.body.anno), ...ids],
      );
    res.json({ ok: true });
  }),
);

module.exports = router;
