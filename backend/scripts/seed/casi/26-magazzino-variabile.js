/* Grande magazzino che cresce: rimanenze iniziali ≠ finali, rotazione del magazzino calcolabile. */
const { profilo } = require("../core/profilo");
const ricavi = [2000000, 2200000, 2500000];
module.exports = {
  ragione_sociale: "Magazzino Pieno S.r.l.",
  partita_iva: "99000000026",
  note: "SEED #26 — rimanenze 100k → 400k → 700k.",
  anno_base: 2025,
  anni: [2023, 2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi, margine: 0.05, cr: 1.6 });
    ctx.bilancio({
      ...ce,
      ...sp,
      rimIniz: [100000, 150000, 400000],
      rimFin: [150000, 400000, 700000],
      rimanenze: [150000, 400000, 700000],
    });
    ctx.quadra();
    ctx.vendite({ tot: ricavi });
  },
};
