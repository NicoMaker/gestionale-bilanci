/* Solo Conto Economico compilato: nessuno Stato Patrimoniale (indici patrimoniali non calcolabili). */
const { profilo } = require("../core/profilo");
const { TIPICA } = require("../core/stagionalita");
const ricavi = [600000, 680000, 750000];
module.exports = {
  ragione_sociale: "Solo Economico S.a.s.",
  partita_iva: "99000000004",
  note: "SEED #04 — Stato Patrimoniale vuoto.",
  anno_base: 2025,
  anni: [2023, 2024, 2025],
  popola(ctx) {
    const { ce } = profilo({ ricavi, margine: [0.04, 0.06, 0.08] });
    ctx.bilancio(ce);
    ctx.vendite({ tot: ricavi, stag: TIPICA });
  },
};
