/* Costi fissi altissimi: il punto di pareggio supera il fatturato dell'anno («oltre il 31 dicembre»). */
const { profilo } = require("../../core/cliente/profilo");
const { TIPICA } = require("../../core/flussi/stagionalita");
const ricavi = [800000, 800000, 800000];
module.exports = {
  ragione_sociale: "Pareggio Lontano S.r.l.",
  partita_iva: "99000000016",
  note: "SEED #16 — BEP > 100% dei ricavi: personale e produzione tutti fissi.",
  anno_base: 2025,
  anni: [2023, 2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({
      ricavi,
      margine: -0.25,
      tipi: { produttivi: "F", personale: "F" },
    });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({ tot: ricavi, stag: TIPICA });
    ctx.parametri(2025, { inflazione: 2 });
  },
};
