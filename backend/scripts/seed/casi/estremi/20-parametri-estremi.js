/* Parametri agli estremi: pesi vendite 0/1/4, inflazione negativa, produttività alta, imposte budget elevate. */
const { profilo } = require("../../core/cliente/profilo");
const ricavi = [700000, 750000, 800000];
module.exports = {
  ragione_sociale: "Parametri Estremi S.r.l.",
  partita_iva: "99000000020",
  note: "SEED #20 — deflazione −3%, produttività 5,5%, peso vendite 0 nel 2023.",
  anno_base: 2025,
  anni: [2023, 2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({ tot: ricavi });
    ctx.parametri(2023, { peso_vendite: 0 });
    ctx.parametri(2024, { peso_vendite: 1 });
    ctx.parametri(2025, {
      peso_vendite: 4,
      inflazione: -3,
      produttivita: 5.5,
      imposte_budget: 99999.99,
      investimento: 1,
      aumento_utile: 1,
    });
  },
};
