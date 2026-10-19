/* Cash Flow 2024-2025 del cliente demo. */
const db = require("../../../../core/db");
const { STAG } = require("../costanti");

function inserisciCashflow({ trova }) {
  const cfAnno = (
    anno,
    tot,
    forn,
    salari,
    iva,
    inps,
    energia,
    consul,
    rata,
  ) => {
    const cf = (sez, descr, importi) => {
      const id = trova(sez, descr);
      importi.forEach(
        (x, m) =>
          x != null &&
          db.run(
            "INSERT OR REPLACE INTO cashflow (voce_id, anno, mese, importo) VALUES (?,?,?,?)",
            [id, anno, m + 1, x],
          ),
      );
    };
    const sc = (t) => STAG.map((p) => Math.round((t * p) / 100 / 1000) * 1000);
    cf("CF_E_GESTIONE", "Incassi da Crediti Verso Clienti", sc(tot));
    cf(
      "CF_U_FORNITORI",
      "Fornitori",
      sc(forn).map((x) => -x),
    );
    cf("CF_U_SALARI", "Salari e stipendi", Array(12).fill(-salari));
    cf("CF_U_F24", "Versamento IVA", [
      -iva[0],
      null,
      null,
      -iva[1],
      null,
      null,
      -iva[2],
      null,
      null,
      -iva[3],
      null,
      null,
    ]);
    cf("CF_U_F24", "Dipendenti + Co.Co.Co.", Array(12).fill(-inps));
    cf("CF_U_ALTRE", "Energia Elettrica", Array(12).fill(-energia));
    cf("CF_U_ALTRE", "Consulenze Amministrative", Array(12).fill(-consul));
    cf("CF_U_RATE", "Rata Finanziamento Banca 1", Array(12).fill(-rata));
  };
  cfAnno(
    2024,
    2400000,
    1300000,
    33000,
    [25000, 22000, 20000, 28000],
    9500,
    3000,
    2750,
    4500,
  );
  cfAnno(
    2025,
    2580000,
    1390000,
    34500,
    [27000, 24000, 22000, 30000],
    10000,
    3200,
    2900,
    4500,
  );
}

module.exports = { inserisciCashflow };
