/* Quadratura: risultato d'esercizio = utile del C.E.; riserva straordinaria = differenza (Check S.P. = 0). */
const db = require("../../../core/db");
const Calc = require("../../../../shared/calc");
const { loadRaw } = require("../../dataset/service");
const { ANNI } = require("./costanti");

function quadraBilancio({ cid, trova }) {
  const ds = Calc.buildDs(loadRaw(cid));
  const rRis = trova("P_PN", "RISULTATO D'ESERCIZIO");
  const rRiserva = trova("P_PN", "RISERVA STRAORDINARIA");
  ANNI.forEach((a) => {
    const utile = Math.round(Calc.ceYear(ds, a).utile);
    db.run(
      "INSERT OR REPLACE INTO valori (voce_id, anno, importo) VALUES (?,?,?)",
      [rRis, a, utile],
    );
  });
  const ds2 = Calc.buildDs(loadRaw(cid));
  ANNI.forEach((a) => {
    const sp = Calc.spYear(ds2, a);
    db.run(
      "INSERT OR REPLACE INTO valori (voce_id, anno, importo) VALUES (?,?,?)",
      [rRiserva, a, Math.round(-sp.check)],
    );
  });
}

module.exports = { quadraBilancio };
