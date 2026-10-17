/* Righe di conto: aggiunta, modifica ed eliminazione. */
const express = require("express");
const db = require("../../core/db");
const Template = require("../../../shared/template.js");
const { HttpError, wrap } = require("../../core/http");
const { toId, clean } = require("../../core/validators");
const { getCliente } = require("../clienti/clienti.service");
const { getVoce, sezioneValida } = require("./voci.service");

const router = express.Router();

router.post(
  "/clienti/:id/voci",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const ambito = clean(req.body.ambito, 2);
    const sez = clean(req.body.sezione, 40);
    const def = sezioneValida(ambito, sez);
    if (!def) throw new HttpError(400, "Sezione non valida");
    if (def.single) throw new HttpError(400, "Questa sezione ha una sola riga");
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

router.put(
  "/voci/:id",
  wrap((req, res) => {
    const v = getVoce(toId(req.params.id));
    const codice =
      req.body.codice !== undefined ? clean(req.body.codice, 30) : v.codice;
    const descr =
      req.body.descrizione !== undefined
        ? clean(req.body.descrizione)
        : v.descrizione;
    let tipo = v.tipo;
    if (req.body.tipo !== undefined) {
      tipo = clean(req.body.tipo, 3).toUpperCase();
      if (v.ambito === "CE" && tipo && !Template.TIPI.some((t) => t.v === tipo))
        throw new HttpError(400, "Tipo non valido");
    }
    db.run("UPDATE voci SET codice=?, descrizione=?, tipo=? WHERE id=?", [
      codice,
      descr,
      tipo,
      v.id,
    ]);
    res.json(
      db.one(
        "SELECT id, ambito, sezione, codice, descrizione, tipo, ordine, fissa FROM voci WHERE id=?",
        [v.id],
      ),
    );
  }),
);

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
