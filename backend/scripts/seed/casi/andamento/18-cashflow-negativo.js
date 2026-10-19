/* Cash flow con saldo iniziale negativo e uscite maggiori delle entrate: liquidità sotto zero per molti mesi. */
const { profilo } = require("../../core/cliente/profilo");
const ricavi = [500000, 520000];
module.exports = {
  ragione_sociale: "Tesoreria in Rosso S.r.l.",
  partita_iva: "99000000018",
  note: "SEED #18 — saldo iniziale −50.000, scoperto di conto.",
  anno_base: 2025,
  anni: [2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({
      ricavi,
      margine: [0.01, -0.02],
      cr: 0.7,
      pn: 0.05,
    });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({ tot: ricavi });
    ctx.parametri(2025, { saldo_iniziale_cf: -50000 });
    ctx.cashflow(2025, {
      incassi: 32000,
      fornitori: -30000,
      salari: -14000,
      iva: [0, 0, -8000, 0, 0, -8000, 0, 0, -8000, 0, 0, -8000],
      rate: -6000,
    });
    ctx.cfRiga(
      2025,
      "CF_E_MUTUI",
      "Anticipo fatture una tantum",
      [0, 0, 0, 0, 0, 40000, 0, 0, 0, 0, 0, 0],
      { nuova: true },
    );
  },
};
