/* POST /clienti/:id/parametri/azzera — riporta a zero (o al default) più parametri di un anno; i valori precedenti vanno nel cestino.
   body: { anno, campi: ["saldo_iniziale_cf", …] } */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, toYear } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");
const C = require("../../cestino/service");
const { CAMPI_PARAM } = require("./campi");

const router = express.Router();

router.post(
  "/clienti/:id/parametri/azzera",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.body.anno);
    const campi = req.body.campi;
    if (
      !Array.isArray(campi) ||
      !campi.length ||
      !campi.every((k) => CAMPI_PARAM.includes(k))
    )
      throw new HttpError(400, "Parametri non validi");
    const riga = db.one(
      "SELECT * FROM parametri_anno WHERE cliente_id=? AND anno=?",
      [c.id, anno],
    );
    if (!riga) return res.json({ ok: true });
    const def = (k) => (k === "peso_vendite" ? 1 : 0);
    const precedenti = Object.fromEntries(
      campi.filter((k) => riga[k] !== def(k)).map((k) => [k, riga[k]]),
    );
    db.tx(() => {
      if (Object.keys(precedenti).length)
        C.sposta({
          tipo: "azzera_parametri",
          cliente: c,
          etichetta: `Parametri azzerati ${anno}: ${Object.keys(precedenti).join(", ")}`,
          dettaglio: "valori precedenti: " + Object.entries(precedenti).map(([k, v]) => `${k} = ${v}`).join(" · "),
          snapshot: { param_set: [{ cliente_id: c.id, anno, campi: precedenti }] },
        });
      for (const k of campi)
        db.run(`UPDATE parametri_anno SET ${k}=? WHERE cliente_id=? AND anno=?`, [def(k), c.id, anno]);
    });
    res.json({ ok: true });
  }),
);

module.exports = router;
