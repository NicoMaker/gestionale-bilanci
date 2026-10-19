/* Società di servizi: nessun acquisto di merci e nessuna rimanenza (rotazione magazzino non calcolabile). */
const { profilo } = require("../core/profilo");
const ricavi = [350000, 410000, 480000];
module.exports = {
  ragione_sociale: "Servizi Digitali S.r.l.",
  partita_iva: "99000000027",
  note: "SEED #27 — acquisti e rimanenze a zero.",
  anno_base: 2025,
  anni: [2023, 2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi, margine: 0.12, cr: 2 });
    ctx.bilancio({
      ...ce,
      ...sp,
      acquisti: 0,
      rimIniz: 0,
      rimFin: 0,
      rimanenze: 0,
    });
    ctx.quadra();
    ctx.vendite({ tot: ricavi, stag: [8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9] });
  },
};
