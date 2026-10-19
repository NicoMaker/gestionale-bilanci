/* PUT /voci/:id — modifica codice, descrizione o tipo di una riga. */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, clean } = require("../../../core/validators");
const Template = require("../../../../../shared/template");
const { getVoce } = require("../service");

const router = express.Router();

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

module.exports = router;
