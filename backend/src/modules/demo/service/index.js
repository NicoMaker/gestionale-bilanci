/* Cliente demo: 4 esercizi di dati coerenti (stato patrimoniale in pareggio), vendite mensili, budget e cash flow. */
const db = require("../../../core/db");
const { creaContesto } = require("./contesto");
const { inserisciContoEconomico } = require("./conto-economico");
const { inserisciStatoPatrimoniale } = require("./stato-patrimoniale");
const { inserisciEsercizio2025 } = require("./esercizio-2025");
const { quadraBilancio } = require("./quadratura");
const { inserisciVendite } = require("./vendite");
const { inserisciParametriBudget } = require("./budget");
const { inserisciCashflow } = require("./cashflow");

function creaDemo() {
  return db.tx(() => {
    const ctx = creaContesto();
    const { servizi, pubblicita } = inserisciContoEconomico(ctx);
    inserisciStatoPatrimoniale(ctx);
    inserisciEsercizio2025(ctx.cid);
    quadraBilancio(ctx);
    inserisciVendite(ctx.cid);
    inserisciParametriBudget({ cid: ctx.cid, servizi, pubblicita });
    inserisciCashflow(ctx);

    return {
      id: ctx.cid,
      ragione_sociale: "Azienda Demo S.r.l.",
      anno_base: 2025,
    };
  });
}

module.exports = { creaDemo };
