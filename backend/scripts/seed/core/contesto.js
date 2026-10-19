/* Contesto di un caso di seed: crea il cliente ed espone le funzioni per popolarlo (bilancio, vendite, cash flow, parametri…). */
const { creaCliente } = require("./cliente");
const { creaHelpers } = require("./voci");
const { popolaBilancio } = require("./bilancio");
const { quadra } = require("./quadratura");
const { inserisciVendite } = require("./vendite");
const { cashflowStd, cfRiga } = require("./cashflow");
const { parametri, budgetVar } = require("./parametri");

function creaContesto(def) {
  const cid = creaCliente(def);
  const ctx = { cid, anni: def.anni, h: creaHelpers(cid, def.anni) };
  ctx.bilancio = (p) => popolaBilancio(ctx, p);
  ctx.quadra = (opzioni) => quadra(ctx, opzioni);
  ctx.vendite = (spec) => inserisciVendite(ctx, spec);
  ctx.cashflow = (anno, spec) => cashflowStd(ctx, anno, spec);
  ctx.cfRiga = (anno, sez, descr, valori, opzioni) =>
    cfRiga(ctx, anno, sez, descr, valori, opzioni);
  ctx.parametri = (anno, valori) => parametri(ctx, anno, valori);
  ctx.budgetVar = (sez, descr, anno, valore) =>
    budgetVar(ctx, sez, descr, anno, valore);
  return ctx;
}

module.exports = { creaContesto };
