/* Esercizi (anni) di un cliente: aggiunta, conteggio dati, eliminazione. */
const express = require("express");
const db = require("../../core/db");
const { HttpError, wrap } = require("../../core/http");
const { toId, toYear } = require("../../core/validators");
const { getCliente, datiCliente } = require("../clienti/clienti.service");

const router = express.Router();

router.post(
  "/clienti/:id/anni",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    let anno = req.body.anno;
    if (anno === undefined || anno === null || anno === "") {
      anno =
        db.one("SELECT MAX(anno) AS m FROM parametri_anno WHERE cliente_id=?", [
          c.id,
        ]).m + 1;
    }
    anno = toYear(anno);
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
      [c.id, anno],
    );
    res.status(201).json({ anno });
  }),
);

router.get(
  "/clienti/:id/anni/:anno/dati",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.params.anno);
    const d = datiCliente(c.id).anni.find((a) => a.anno === anno) || {
      anno,
      valori: 0,
      vendite: 0,
      cashflow: 0,
      budget_var: 0,
      parametri: 0,
      totale: 0,
    };
    res.json(Object.assign({ ha_dati: d.totale > 0 }, d));
  }),
);

router.delete(
  "/clienti/:id/anni/:anno",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.params.anno);
    const esiste = db.one(
      "SELECT 1 AS x FROM parametri_anno WHERE cliente_id=? AND anno=?",
      [c.id, anno],
    );
    const dAnno = datiCliente(c.id).anni.find((a) => a.anno === anno);
    if (!esiste && !(dAnno && dAnno.totale))
      throw new HttpError(404, "Anno non presente per questo cliente");
    const nAnni = new Set([
      ...db
        .all("SELECT anno FROM parametri_anno WHERE cliente_id=?", [c.id])
        .map((r) => r.anno),
      ...datiCliente(c.id)
        .anni.filter((a) => a.totale)
        .map((a) => a.anno),
    ]).size;
    if (nAnni <= 1)
      throw new HttpError(400, "Il cliente deve avere almeno un anno");
    if (dAnno && dAnno.totale && String(req.query.conferma) !== "1") {
      return res
        .status(409)
        .json({
          error: "L'anno contiene dati: conferma l'eliminazione",
          richiede_conferma: true,
          dati: dAnno,
        });
    }
    db.tx(() => {
      const sub = "SELECT id FROM voci WHERE cliente_id=?";
      db.run(`DELETE FROM valori WHERE anno=? AND voce_id IN (${sub})`, [
        anno,
        c.id,
      ]);
      db.run(`DELETE FROM budget_var WHERE anno=? AND voce_id IN (${sub})`, [
        anno,
        c.id,
      ]);
      db.run(`DELETE FROM cashflow WHERE anno=? AND voce_id IN (${sub})`, [
        anno,
        c.id,
      ]);
      db.run("DELETE FROM vendite WHERE cliente_id=? AND anno=?", [c.id, anno]);
      db.run("DELETE FROM parametri_anno WHERE cliente_id=? AND anno=?", [
        c.id,
        anno,
      ]);
    });
    res.json({ ok: true });
  }),
);

module.exports = router;
