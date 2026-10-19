/* Vendite concentrate: tutto a dicembre, un solo mese (agosto), solo primo semestre con mesi vuoti. */
const {
  SOLO_DICEMBRE,
  SOLO_AGOSTO,
  PRIMO_SEMESTRE,
} = require("../../core/flussi/stagionalita");
const { profilo } = require("../../core/cliente/profilo");
const ricavi = [400000, 450000, 500000];
module.exports = {
  ragione_sociale: "Stagionalità Estrema S.r.l.",
  partita_iva: "99000000021",
  note: "SEED #21 — 2023 solo dicembre, 2024 solo agosto, 2025 solo gennaio-giugno.",
  anno_base: 2025,
  anni: [2023, 2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({
      tot: ricavi,
      stag: [SOLO_DICEMBRE, SOLO_AGOSTO, PRIMO_SEMESTRE],
    });
  },
};
