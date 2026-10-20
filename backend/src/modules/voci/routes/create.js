/* POST /clienti/:id/voci — aggiunge una riga di conto. */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, clean } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");
const { sezioneValida } = require("../service");

const router = express.Router();

router.post(
  "/clienti/:id/voci",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const ambito = clean(req.body.ambito, 2);
    const sez = clean(req.body.sezione, 40);
    const def = sezioneValida(ambito, sez);
    if (!def) throw new HttpError(400, "Sezione non valida");
    // le sezioni a riga singola accettano una nuova riga solo se la precedente è stata eliminata
    if (
      def.single &&
      db.one("SELECT id FROM voci WHERE cliente_id=? AND sezione=? LIMIT 1", [
        c.id,
        sez,
      ])
    )
      throw new HttpError(400, "Questa sezione ha una sola riga");
    const max = db.one(
      "SELECT COALESCE(MAX(ordine),0) AS m FROM voci WHERE cliente_id=? AND sezione=?",
      [c.id, sez],
    ).m;
    const tipo =
      ambito === "CE"
        ? clean(req.body.tipo || def.tipo || "F", 3).toUpperCase()
        : "";
    const id = db.insert(
      "INSERT INTO voci (cliente_id, ambito, sezione, codice, descrizione, tipo, ordine, fissa) VALUES (?,?,?,?,?,?,?,0)",
      [
        c.id,
        ambito,
        sez,
        clean(req.body.codice, 30),
        clean(req.body.descrizione),
        tipo,
        max + 1,
      ],
    );
    res
      .status(201)
      .json(
        db.one(
          "SELECT id, ambito, sezione, codice, descrizione, tipo, ordine, fissa FROM voci WHERE id=?",
          [id],
        ),
      );
  }),
);

module.exports = router;
