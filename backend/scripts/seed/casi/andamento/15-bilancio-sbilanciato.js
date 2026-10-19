/* Stato Patrimoniale che NON quadra: Check ≠ 0 (in positivo e in negativo) in due anni su tre. */
const { profilo } = require("../../core/cliente/profilo");
const ricavi = [900000, 950000, 1000000];
module.exports = {
  ragione_sociale: "Bilancio Sbilanciato S.r.l.",
  partita_iva: "99000000015",
  note: "SEED #15 — check S.P.: 0 / +12.500,50 / −8.000.",
  anno_base: 2025,
  anni: [2023, 2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra({ sbilancio: [0, 12500.5, -8000] });
    ctx.vendite({ tot: ricavi });
  },
};
