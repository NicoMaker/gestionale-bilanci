/* Start-up pre-revenue: costi ma ricavi a zero (BEP e margini non calcolabili, divisioni per zero). */
module.exports = {
  ragione_sociale: "Startup Senza Ricavi S.r.l.",
  partita_iva: "99000000017",
  note: "SEED #17 — ricavi zero in tutti gli anni.",
  anno_base: 2025,
  anni: [2024, 2025],
  popola(ctx) {
    ctx.bilancio({
      ricavi: [0, 0],
      personale: [60000, 120000],
      amministrativi: [20000, 35000],
      ammortamenti: [5000, 12000],
      immImm: [80000, 80000],
      immMat: [100000, 150000],
      fondoMat: [-5000, -17000],
      liquidita: [120000, 60000],
      capitale: [250000, 250000],
      banche: [30000, 60000],
      fornitori: [15000, 25000],
    });
    ctx.quadra();
    ctx.vendite({ tot: [0, 0] });
    ctx.parametri(2025, { investimento: 100000, saldo_iniziale_cf: 60000 });
    ctx.cashflow(2025, {
      soci: [100000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      salari: -10000,
      fornitori: -2500,
    });
  },
};
