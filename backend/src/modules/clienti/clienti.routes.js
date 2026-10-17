/* Anagrafica clienti: elenco, creazione, modifica, eliminazione (con conferma se ci sono dati). */
const express = require("express");
const db = require("../../core/db");
const { HttpError, wrap } = require("../../core/http");
const { toId, toYear, clean, norm } = require("../../core/validators");
const { getCliente, datiCliente, validaCliente } = require("./clienti.service");
const { seedCliente } = require("./clienti.seed");

const router = express.Router();

router.get(
  "/clienti",
  wrap((req, res) => {
    const rows = db.all(
      "SELECT * FROM clienti ORDER BY ragione_sociale COLLATE NOCASE",
    );
    const anni = db.all(
      "SELECT cliente_id, anno FROM parametri_anno ORDER BY anno",
    );
    for (const c of rows)
      c.anni = anni.filter((a) => a.cliente_id === c.id).map((a) => a.anno);
    res.json(rows);
  }),
);

router.post(
  "/clienti",
  wrap((req, res) => {
    const { ragione, piva } = validaCliente(req.body, 0);
    const anno = toYear(req.body.anno_base);
    if (anno < 1990 || anno > 2100)
      throw new HttpError(400, "Anno impostato non valido (1990–2100)");
    const id = db.tx(() => {
      const cid = db.insert(
        "INSERT INTO clienti (ragione_sociale, partita_iva, note, anno_base) VALUES (?,?,?,?)",
        [ragione, piva, clean(req.body.note, 2000), anno],
      );
      seedCliente(cid, anno);
      return cid;
    });
    res.status(201).json(getCliente(id));
  }),
);

router.get(
  "/clienti/:id",
  wrap((req, res) => res.json(getCliente(toId(req.params.id)))),
);

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
    db.run(
      "UPDATE clienti SET ragione_sociale=?, partita_iva=?, note=? WHERE id=?",
      [ragione, piva, clean(req.body.note ?? c.note, 2000), c.id],
    );
    res.json(getCliente(c.id));
  }),
);

router.get(
  "/clienti/:id/dati",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    res.json(Object.assign({ cliente: c.ragione_sociale }, datiCliente(c.id)));
  }),
);

// Cliente senza dati → eliminazione diretta. Cliente con dati → serve ?conferma=<ragione sociale esatta>.
router.delete(
  "/clienti/:id",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const d = datiCliente(c.id);
    if (d.ha_dati && norm(req.query.conferma) !== norm(c.ragione_sociale)) {
      return res
        .status(409)
        .json({
          error:
            "Il cliente contiene dati: per eliminarlo conferma digitando la ragione sociale",
          richiede_conferma: true,
          dati: d,
        });
    }
    db.tx(() => {
      // eliminazione esplicita (non ci affidiamo solo al CASCADE)
      db.run(
        "DELETE FROM valori WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)",
        [c.id],
      );
      db.run(
        "DELETE FROM budget_var WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)",
        [c.id],
      );
      db.run(
        "DELETE FROM cashflow WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)",
        [c.id],
      );
      db.run("DELETE FROM voci WHERE cliente_id=?", [c.id]);
      db.run("DELETE FROM vendite WHERE cliente_id=?", [c.id]);
      db.run("DELETE FROM parametri_anno WHERE cliente_id=?", [c.id]);
      db.run("DELETE FROM clienti WHERE id=?", [c.id]);
    });
    res.json({ ok: true });
  }),
);

module.exports = router;
