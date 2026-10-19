/* Quadratura: risultato d'esercizio = utile del C.E.; riserva straordinaria = quanto serve perché il Check dello S.P. valga `sbilancio`
   (0 = bilancio in pareggio; un altro numero lascia volutamente il bilancio sbilanciato). Gli anni completamente vuoti vengono saltati. */
const db = require("../../../src/core/db");
const Calc = require("../../../shared/calc");
const { loadRaw } = require("./dataset");

function quadra(ctx, { sbilancio = 0 } = {}) {
  const { cid, anni } = ctx;
  const rRis = ctx.h.trova("P_PN", "RISULTATO D'ESERCIZIO");
  const rRiserva = ctx.h.trova("P_PN", "RISERVA STRAORDINARIA");
  const put = (id, a, v) =>
    db.run(
      "INSERT OR REPLACE INTO valori (voce_id, anno, importo) VALUES (?,?,?)",
      [id, a, v],
    );
  const vuoto = (ds, a) => {
    const sp = Calc.spYear(ds, a),
      ce = Calc.ceYear(ds, a);
    return (
      !sp.totale_attivo &&
      !sp.totale_passivita &&
      !ce.ricavi &&
      !ce.costi_operativi &&
      !ce.utile
    );
  };

  let ds = Calc.buildDs(loadRaw(cid));
  const attivi = anni.filter((a) => !vuoto(ds, a));
  attivi.forEach((a) =>
    put(rRis, a, Math.round(Calc.ceYear(ds, a).utile * 100) / 100),
  );
  ds = Calc.buildDs(loadRaw(cid));
  attivi.forEach((a) => {
    const i = anni.indexOf(a);
    const s = Array.isArray(sbilancio) ? sbilancio[i] || 0 : sbilancio;
    put(rRiserva, a, Math.round((s - Calc.spYear(ds, a).check) * 100) / 100);
  });
}

module.exports = { quadra };
