/* PUT /clienti/:id — modifica anagrafica.
   anno_base (facoltativo): si può cambiare solo con uno degli esercizi già creati per il cliente. */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, toYear, clean } = require("../../../core/validators");
const { getCliente, validaCliente } = require("../service");
const { anniCliente } = require("../../anni/service/elimina");

const router = express.Router();

router.put(
  "/clienti/:id",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const { ragione, piva } = validaCliente(
      {
        ragione_sociale: req.body.ragione_sociale ?? c.ragione_sociale,
        partita_iva: req.body.partita_iva ?? c.partita_iva,
      },
      c.id,
    );
    let annoBase = c.anno_base;
    const richiesto = req.body.anno_base;
    if (richiesto !== undefined && richiesto !== null && richiesto !== "") {
      annoBase = toYear(richiesto);
      const esercizi = anniCliente(c.id);
      if (annoBase !== c.anno_base && !esercizi.has(annoBase))
        throw new HttpError(
          400,
          `L'anno base deve essere uno degli esercizi già creati per il cliente (${[...esercizi].sort((a, b) => a - b).join(", ")})`,
        );
    }
    db.run(
      "UPDATE clienti SET ragione_sociale=?, partita_iva=?, note=?, anno_base=? WHERE id=?",
      [ragione, piva, clean(req.body.note ?? c.note, 2000), annoBase, c.id],
    );
    res.json(getCliente(c.id));
  }),
);

module.exports = router;
