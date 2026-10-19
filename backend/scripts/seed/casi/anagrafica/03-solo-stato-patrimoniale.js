/* Solo Stato Patrimoniale compilato: il Conto Economico resta vuoto (rating con ROS/oneri non calcolabili). */
const { profilo } = require("../../core/cliente/profilo");
module.exports = {
  ragione_sociale: "Solo Patrimonio S.n.c.",
  partita_iva: "99000000003",
  note: "SEED #03 — Conto Economico vuoto.",
  anno_base: 2025,
  anni: [2023, 2024, 2025],
  popola(ctx) {
    const { sp } = profilo({ ricavi: [700000, 760000, 820000], t: 1.2 });
    ctx.bilancio(sp);
    ctx.quadra();
  },
};
