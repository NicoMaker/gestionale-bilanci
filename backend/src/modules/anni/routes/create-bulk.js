/* POST /anni/bulk — crea gli esercizi di uno o più anni per più clienti (salta chi li ha già).
   body: { cliente_ids: [..], anno }  oppure  { cliente_ids, anni: [2022, 2023] }  oppure  { cliente_ids, da: 2020, a: 2024 }
   Data di chiusura: data_chiusura (un solo anno) oppure giorno_mese «GG/MM» (stessa per tutti); date {anno: data} (per anno);
   date_clienti {idCliente: {anno: data}} (per singolo cliente e anno). Senza indicazioni l'esercizio chiude il 31/12. */
const express = require("express");
const { wrap } = require("../../../core/http");
const { toIds, toAnni, toDateEsercizi } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");
const { creaEsercizi } = require("../service/crea-esercizi");

const router = express.Router();

router.post(
  "/anni/bulk",
  wrap((req, res) => {
    const anni = toAnni(req.body);
    const dataPer = toDateEsercizi(req.body, anni);
    const clienti = toIds(req.body.cliente_ids).map(getCliente); // 404 se uno non esiste
    const dettaglio = creaEsercizi(clienti, anni, dataPer);
    const creati = dettaglio.reduce((n, d) => n + d.creati.length, 0);
    const date = Object.fromEntries(anni.map((a) => [a, dataPer(a)]));
    const out = {
      anni,
      date,
      creati, // esercizi creati in totale (cliente × anno)
      saltati: clienti.length * anni.length - creati,
      dettaglio,
    };
    if (anni.length === 1) {
      out.anno = anni[0]; // risposta di sempre per un anno solo
      out.data_chiusura = date[anni[0]];
    }
    res.status(201).json(out);
  }),
);

module.exports = router;
