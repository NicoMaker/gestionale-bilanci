/* Base comune dei casi «rating»: 3 esercizi con bilancio coerente, vendite, parametri e cash flow. Cambiano solo i 4 parametri di rischio. */
const { profilo } = require("../core/profilo");

const ANNI = [2023, 2024, 2025];
const RICAVI = [900000, 1000000, 1100000];

function casoRating(n, sigla, descrizione, knobs) {
  return {
    ragione_sociale: `Rating ${sigla} S.r.l.`,
    partita_iva: String(99000000000 + n),
    note: `SEED #${String(n).padStart(2, "0")} — rating atteso ${sigla}. ${descrizione}`,
    anno_base: 2025,
    anni: ANNI,
    atteso: { rating: sigla },
    popola(ctx) {
      const { ce, sp } = profilo({ ricavi: RICAVI, ...knobs });
      ctx.bilancio({ ...ce, ...sp });
      ctx.quadra();
      ctx.vendite({ tot: RICAVI });
      ctx.parametri(2025, {
        inflazione: 2,
        produttivita: 1,
        saldo_iniziale_cf: 40000,
      });
      ctx.cashflow(2025, {
        incassi: 90000,
        fornitori: -45000,
        salari: -25000,
        rate: -3000,
      });
    },
  };
}

module.exports = { casoRating };
