/* Parametri annuali (peso vendite, inflazione, produttività, imposte budget, investimento, aumento utile, saldo iniziale CF)
   e variazioni manuali del budget. */
const db = require("../../../src/core/db");

const CAMPI = [
  "peso_vendite",
  "inflazione",
  "produttivita",
  "imposte_budget",
  "investimento",
  "aumento_utile",
  "saldo_iniziale_cf",
];

function parametri(ctx, anno, valori) {
  for (const [k, v] of Object.entries(valori)) {
    if (!CAMPI.includes(k)) throw new Error("Parametro sconosciuto: " + k);
    db.run(`UPDATE parametri_anno SET ${k}=? WHERE cliente_id=? AND anno=?`, [
      v,
      ctx.cid,
      anno,
    ]);
  }
}

// valore con decimali (1,10) = moltiplicatore · intero (5000, -2000) = importo sommato · vuoto = fattore del tipo
function budgetVar(ctx, sez, descr, anno, valore) {
  db.run(
    "INSERT OR REPLACE INTO budget_var (voce_id, anno, valore) VALUES (?,?,?)",
    [ctx.h.trova(sez, descr), anno, valore],
  );
}

module.exports = { parametri, budgetVar };
