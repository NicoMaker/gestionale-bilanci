/* Investimento: 2024 senza investimento, 2025 con investimento grande e aumento di utile atteso. */
const { profilo } = require("../core/profilo");
const ricavi = [1200000, 1300000];
module.exports = {
  ragione_sociale: "Piano Investimenti S.p.A.",
  partita_iva: "99000000019",
  note: "SEED #19 — investimento 800.000 e aumento utile 100.000 nel 2025.",
  anno_base: 2025,
  anni: [2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi, margine: [0.07, 0.08] });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({ tot: ricavi });
    ctx.parametri(2024, { investimento: 0, aumento_utile: 0 });
    ctx.parametri(2025, {
      investimento: 800000,
      aumento_utile: 100000,
      inflazione: 2.5,
      produttivita: 1.5,
    });
  },
};
