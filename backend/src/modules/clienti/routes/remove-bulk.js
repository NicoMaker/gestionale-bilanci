/* POST /clienti/elimina-multiplo — elimina più clienti in un'unica operazione.
   body: { ids:[…], anteprima?:true, conferma?:"ELIMINA" }
   - anteprima: non elimina nulla, dice quali clienti contengono dati;
   - se almeno un cliente contiene dati serve conferma = "ELIMINA" (409 altrimenti). */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");
const { toIds, norm } = require("../../../core/validators");
const { getCliente, datiCliente, eliminaCliente } = require("../service");

const PAROLA_CONFERMA = "ELIMINA";
const router = express.Router();

router.post(
  "/clienti/elimina-multiplo",
  wrap((req, res) => {
    const clienti = toIds(req.body.ids).map(getCliente); // 404 se uno non esiste
    const conDati = clienti
      .map((c) => ({
        id: c.id,
        ragione_sociale: c.ragione_sociale,
        totale: datiCliente(c.id).totale,
      }))
      .filter((c) => c.totale > 0);

    if (req.body.anteprima)
      return res.json({
        totale: clienti.length,
        senza_dati: clienti.length - conDati.length,
        con_dati: conDati,
        parola_conferma: PAROLA_CONFERMA,
      });

    if (conDati.length && norm(req.body.conferma) !== norm(PAROLA_CONFERMA))
      return res.status(409).json({
        error: `${conDati.length} clienti contengono dati: per eliminarli digita ${PAROLA_CONFERMA}`,
        richiede_conferma: true,
        con_dati: conDati,
      });

    db.tx(() => clienti.forEach((c) => eliminaCliente(c.id)));
    res.json({ ok: true, eliminati: clienti.length });
  }),
);

module.exports = router;
