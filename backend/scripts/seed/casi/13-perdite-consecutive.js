/* Tre esercizi in perdita sempre più pesante, indici negativi. */
const { profilo } = require("../core/profilo");
const ricavi = [820000, 760000, 690000];
module.exports = {
  ragione_sociale: "Perdite Consecutive S.p.A.",
  partita_iva: "99000000013",
  note: "SEED #13 — utile negativo in tutti gli anni, ricavi in calo.",
  anno_base: 2025,
  anni: [2023, 2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({
      ricavi,
      margine: [-0.02, -0.06, -0.12],
      cr: 0.8,
      pn: 0.15,
      oneri: 0.06,
    });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({ tot: ricavi });
    ctx.parametri(2025, { inflazione: 3, produttivita: 2 });
  },
};
