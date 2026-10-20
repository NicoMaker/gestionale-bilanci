/* GET /statistiche[?anno=YYYY] — totali di tutto lo studio: clienti, esercizi, ricavi, utile, rating, avvisi.
   Senza anno: ultimo esercizio di ogni cliente. Con anno: i dati di quell'esercizio. */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");
const { toYear } = require("../../../core/validators");
const Calc = require("../../../../../shared/calc");
const { loadRaw } = require("../../dataset/service");

const router = express.Router();

/* Ultimo esercizio che contiene davvero dei numeri (non vuoto). */
function ultimaRiga(rows) {
  for (let i = rows.length - 1; i >= 0; i--)
    if (!rows[i].vuoto || rows[i].ricavi) return rows[i];
  return rows.length ? rows[rows.length - 1] : null;
}

router.get(
  "/statistiche",
  wrap((req, res) => {
    const annoSel =
      req.query.anno === undefined || req.query.anno === ""
        ? null
        : toYear(req.query.anno);
    const clienti = db.all(
      "SELECT id, ragione_sociale, partita_iva, anno_base, created_at FROM clienti ORDER BY ragione_sociale COLLATE NOCASE",
    );
    const tot = {
      clienti: clienti.length,
      clienti_con_dati: 0,
      esercizi: 0,
      ricavi: 0,
      ebitda: 0,
      utile: 0,
      attivo: 0,
      pn: 0,
      utile_positivo: 0,
      utile_negativo: 0,
      quadratura_ko: 0,
    };
    const rating = {};
    const dettaglio = [];
    const anniDisponibili = new Set();

    for (const c of clienti) {
      let rows = [];
      try {
        rows = Calc.riepilogo(Calc.buildDs(loadRaw(c.id)));
      } catch (e) {
        rows = [];
      }
      tot.esercizi += rows.length;
      rows.forEach((r) => anniDisponibili.add(r.anno));
      const u = annoSel
        ? rows.find((r) => r.anno === annoSel)
        : ultimaRiga(rows);
      const riga = {
        id: c.id,
        ragione_sociale: c.ragione_sociale,
        partita_iva: c.partita_iva,
        esercizi: rows.length,
        anno: u ? u.anno : null,
        ricavi: u ? u.ricavi : 0,
        ebitda: u ? u.ebitda : 0,
        utile: u ? u.utile : 0,
        attivo: u ? u.attivo : 0,
        pn: u ? u.pn : 0,
        rating: u ? u.rating : null,
        vuoto: u ? !!u.vuoto : true,
        quadra: u ? Math.abs(u.check || 0) < 1 : true,
      };
      if (u && !u.vuoto) {
        tot.clienti_con_dati++;
        tot.ricavi += riga.ricavi || 0;
        tot.ebitda += riga.ebitda || 0;
        tot.utile += riga.utile || 0;
        tot.attivo += riga.attivo || 0;
        tot.pn += riga.pn || 0;
        if (riga.utile >= 0) tot.utile_positivo++;
        else tot.utile_negativo++;
        if (!riga.quadra) tot.quadratura_ko++;
        const r = riga.rating || "n.d.";
        rating[r] = (rating[r] || 0) + 1;
      }
      dettaglio.push(riga);
    }

    const per_anno = {};
    for (const c of clienti) {
      const d = dettaglio.find((x) => x.id === c.id);
      if (d && d.anno != null) per_anno[d.anno] = (per_anno[d.anno] || 0) + 1;
    }

    res.json({
      anno: annoSel,
      anni_disponibili: [...anniDisponibili].sort((a, b) => b - a),
      totali: tot,
      rating,
      per_anno,
      clienti: dettaglio,
    });
  }),
);

module.exports = router;
