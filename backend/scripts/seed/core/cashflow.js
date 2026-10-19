/* Cash flow di un anno. Le uscite si inseriscono con segno NEGATIVO (come nel file Excel originale). */
const db = require("../../../src/core/db");

const dodici = (x) => (Array.isArray(x) ? x : Array(12).fill(x));

// una riga di cash flow (predefinita o nuova) con 12 importi (numero = uguale in tutti i mesi, null = mese vuoto)
function cfRiga(ctx, anno, sez, descr, valori, { nuova = false } = {}) {
  const id = nuova ? ctx.h.aggiungi(sez, descr) : ctx.h.trova(sez, descr);
  dodici(valori).forEach((x, m) => {
    if (x != null)
      db.run(
        "INSERT OR REPLACE INTO cashflow (voce_id, anno, mese, importo) VALUES (?,?,?,?)",
        [id, anno, m + 1, x],
      );
  });
}

const MAPPA = {
  incassi: ["CF_E_GESTIONE", "Incassi da Crediti Verso Clienti"],
  mutuo: ["CF_E_MUTUI", "Erogazione Mutuo"],
  soci: ["CF_E_SOCI", "Apporto Soci"],
  fornitori: ["CF_U_FORNITORI", "Fornitori"],
  salari: ["CF_U_SALARI", "Salari e stipendi"],
  iva: ["CF_U_F24", "Versamento IVA"],
  energia: ["CF_U_ALTRE", "Energia Elettrica"],
  rate: ["CF_U_RATE", "Rata Finanziamento Banca 1"],
};

// spec: { incassi, mutuo, soci, fornitori, salari, iva, energia, rate } → ciascuno numero | array di 12
function cashflowStd(ctx, anno, spec) {
  for (const k of Object.keys(spec)) {
    if (!MAPPA[k]) throw new Error("Voce cash flow sconosciuta: " + k);
    cfRiga(ctx, anno, MAPPA[k][0], MAPPA[k][1], spec[k]);
  }
}

module.exports = { cfRiga, cashflowStd };
