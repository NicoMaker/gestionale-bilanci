/* Cinque esercizi in forte crescita: vendite stagionali, parametri per ogni anno, variazioni budget (moltiplicatore e importo), cash flow. */
const { profilo } = require("../core/profilo");
const ricavi = [500000, 640000, 820000, 1050000, 1340000];
module.exports = {
  ragione_sociale: "Crescita Rapida S.r.l.",
  partita_iva: "99000000014",
  note: "SEED #14 — 5 anni 2021-2025, ricavi +25% l'anno, budget con variazioni manuali.",
  anno_base: 2025,
  anni: [2021, 2022, 2023, 2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({
      ricavi,
      margine: [0.01, 0.03, 0.05, 0.07, 0.09],
      cr: 1.3,
      pn: 0.2,
      oneri: 0.04,
    });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({ tot: ricavi });
    ctx.anni.forEach((a, i) =>
      ctx.parametri(a, {
        peso_vendite: i + 1,
        inflazione: 1.5 + i * 0.2,
        produttivita: 1 + i * 0.5,
        imposte_budget: 20000 + i * 8000,
      }),
    );
    ctx.parametri(2025, {
      investimento: 150000,
      aumento_utile: 25000,
      saldo_iniziale_cf: 80000,
    });
    for (const a of [2024, 2025]) {
      ctx.budgetVar("C_RICAVI", "Ricavi vendite", a, 1.15); // decimale = moltiplicatore (+15%)
      ctx.budgetVar("C_COMMERCIALI", "Costi commerciali", a, 5000); // intero = importo sommato
    }
    ctx.budgetVar("C_PERSONALE", "Salari e stipendi", 2025, 0.97);
    ctx.cashflow(2025, {
      incassi: 115000,
      fornitori: -52000,
      salari: -30000,
      iva: [0, 0, -9000, 0, 0, -9000, 0, 0, -9000, 0, 0, -9000],
      rate: -4500,
    });
  },
};
