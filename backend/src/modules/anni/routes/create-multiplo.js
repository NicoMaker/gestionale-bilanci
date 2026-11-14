/* POST /clienti/:id/anni/multiplo — crea più esercizi di un cliente in un colpo (anni già presenti saltati).
   body: { anni: [2020, 2021, 2023] }  oppure  { da: 2020, a: 2024 }
   Data di chiusura: giorno_mese «GG/MM» uguale per tutti gli esercizi, e/o date {anno: "AAAA-MM-GG"} diversa per anno; vuoto = 31/12. */
const express = require("express");
const { wrap } = require("../../../core/http");
const { toId, toAnni, toDateEsercizi } = require("../../../core/validators");
const { getCliente } = require("../../clienti/service");
const { creaEsercizi } = require("../service/crea-esercizi");

const router = express.Router();

router.post(
  "/clienti/:id/anni/multiplo",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anni = toAnni(req.body);
    const dataPer = toDateEsercizi(req.body, anni);
    const [d] = creaEsercizi([c], anni, dataPer);
    res.status(201).json({
      anni,
      creati: d.creati,
      saltati: d.saltati,
      date: d.date,
    });
  }),
);

module.exports = router;
