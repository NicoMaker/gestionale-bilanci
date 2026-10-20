/* Cestino: elenco, ripristino, eliminazione definitiva e svuotamento. Gli elementi restano 15 giorni. */
const express = require("express");
const db = require("../../../core/db");
const { HttpError, wrap } = require("../../../core/http");
const { toIds } = require("../../../core/validators");
const C = require("../service");

const router = express.Router();
const ids = (b) => toIds(b.ids, 5000, "elemento");

router.get(
  "/cestino",
  wrap((req, res) =>
    res.json({ giorni: C.GIORNI, elementi: C.elenco() }),
  ),
);

router.get(
  "/cestino/conteggio",
  wrap((req, res) => res.json({ n: C.conteggio() })),
);

// ripristina uno o più elementi; con un solo elemento un errore è una risposta 409
router.post(
  "/cestino/ripristina",
  wrap((req, res) => {
    const r = C.ripristina(ids(req.body));
    if (r.errori.length && !r.ripristinati.length && r.errori.length === 1)
      throw new HttpError(409, r.errori[0].error);
    res.json(r);
  }),
);

// eliminazione definitiva di elementi scelti
router.post(
  "/cestino/elimina",
  wrap((req, res) => {
    const lista = ids(req.body);
    const n = db.one(
      `SELECT COUNT(*) AS n FROM cestino WHERE id IN (${lista.map(() => "?").join(",")})`,
      lista,
    ).n;
    if (n !== lista.length)
      throw new HttpError(404, "Elemento non trovato nel cestino");
    db.tx(() => C.elimina(lista));
    res.json({ ok: true, eliminati: n });
  }),
);

router.delete(
  "/cestino",
  wrap((req, res) => res.json({ ok: true, eliminati: db.tx(C.svuota) })),
);

module.exports = router;
