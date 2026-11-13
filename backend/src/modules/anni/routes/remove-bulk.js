/* POST /clienti/:id/anni/elimina-multiplo — elimina più esercizi insieme (selezione di più anni).
   body: { anni: [2022, 2023, …], conferma?: 1, anteprima?: true }
   - tutto o niente: se un anno non esiste, o se non ne resterebbe nemmeno uno, non viene eliminato nulla;
   - se qualche anno contiene dati serve conferma: 1 (altrimenti 409 con l'elenco degli anni con dati);
   - anteprima: true non elimina, restituisce solo l'elenco (con_dati / senza_dati). */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toId, toYear } = require("../../../core/validators");
const { getCliente, datiCliente } = require("../../clienti/service");
const { anniCliente, eliminaEsercizio } = require("../service/elimina");

const router = express.Router();

router.post(
  "/clienti/:id/anni/elimina-multiplo",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const lista = req.body.anni;
    if (!Array.isArray(lista) || !lista.length)
      throw new HttpError(400, "Seleziona almeno un anno");
    if (lista.length > 200) throw new HttpError(400, "Troppi anni selezionati");
    const anni = [...new Set(lista.map(toYear))].sort((a, b) => a - b);

    const esistenti = anniCliente(c.id);
    const mancanti = anni.filter((a) => !esistenti.has(a));
    if (mancanti.length)
      throw new HttpError(
        404,
        `Anno non presente per questo cliente: ${mancanti.join(", ")}`,
      );
    if (anni.length >= esistenti.size)
      throw new HttpError(
        400,
        "Il cliente deve avere almeno un anno: non puoi eliminarli tutti",
      );

    const dati = datiCliente(c.id).anni;
    const dettaglio = anni.map((anno) => {
      const d = dati.find((x) => x.anno === anno);
      return { anno, totale: d ? d.totale : 0, dati: d || null };
    });
    const conDati = dettaglio.filter((d) => d.totale > 0);
    const senzaDati = dettaglio.length - conDati.length;

    if (req.body.anteprima === true)
      return res.json({ anni, con_dati: conDati, senza_dati: senzaDati });

    if (conDati.length && String(req.body.conferma) !== "1")
      return res.status(409).json({
        error: "Alcuni anni contengono dati: conferma l'eliminazione",
        richiede_conferma: true,
        con_dati: conDati,
        senza_dati: senzaDati,
      });

    db.tx(() =>
      dettaglio.forEach((d) => eliminaEsercizio(c, d.anno, d.dati)),
    );
    res.json({ ok: true, eliminati: anni.length, anni });
  }),
);

module.exports = router;
