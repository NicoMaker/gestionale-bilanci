/* Importi enormi (oltre 12 miliardi) e minuscoli con decimali. */
const { profilo } = require("../../core/cliente/profilo");
const ricavi = [12345678901.23, 12.5];
module.exports = {
  ragione_sociale: "Numeri Estremi Holding S.p.A.",
  partita_iva: "99000000022",
  note: "SEED #22 — 2024 in miliardi, 2025 in decimali (12,50 di ricavi).",
  anno_base: 2025,
  anni: [2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi, margine: [0.1, 0.07], t: 1.5 });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({ tot: ricavi });
    ctx.parametri(2025, {
      investimento: 0.5,
      aumento_utile: 0.25,
      saldo_iniziale_cf: 1234567890.12,
    });
  },
};
