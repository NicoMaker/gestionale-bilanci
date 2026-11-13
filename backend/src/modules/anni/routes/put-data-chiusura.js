/* PUT /clienti/:id/anni/:anno/data-chiusura — cambia la data di chiusura di un esercizio.
   data_chiusura vuota o assente = 31/12 dell'anno. Accetta AAAA-MM-GG oppure GG/MM/AAAA. */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");
const { toId, toYear, toDataChiusura } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");

const router = express.Router();

router.put(
  "/clienti/:id/anni/:anno/data-chiusura",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.params.anno);
    const dataChiusura = toDataChiusura(req.body.data_chiusura, anno);
    // se l'esercizio ha solo dati (nessuna riga parametri) la riga viene creata; il trigger mette il 31/12
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
      [c.id, anno],
    );
    db.run(
      "UPDATE parametri_anno SET data_chiusura=? WHERE cliente_id=? AND anno=?",
      [dataChiusura, c.id, anno],
    );
    res.json({ anno, data_chiusura: dataChiusura });
  }),
);

module.exports = router;
