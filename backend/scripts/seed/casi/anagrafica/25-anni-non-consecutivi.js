/* Anni non consecutivi (2019, 2022, 2025) e un anno senza dati (2022: solo parametri). */
const { profilo } = require("../../core/cliente/profilo");
const ricavi = [800000, null, 1000000];
module.exports = {
  ragione_sociale: "Anni Discontinui S.r.l.",
  partita_iva: "99000000025",
  note: "SEED #25 — il 2022 esiste ma è vuoto.",
  anno_base: 2025,
  anni: [2019, 2022, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({ tot: ricavi });
    ctx.parametri(2022, { inflazione: 1.2 });
  },
};
