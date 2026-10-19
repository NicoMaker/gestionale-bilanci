/* Rating: soglie dello scoring. */
const assert = require("assert");
const { t } = require("../helpers/runner");
const Calc = require("../../../shared/calc");

module.exports = async function () {
  await t("rating: soglie dello scoring", async () => {
    const sp = {
      rimanenze: 0,
      crediti_entro: 100,
      liquidita: 0,
      risconti: 0,
      attivo_fisso: 0,
      totale_attivo: 1000,
      banche: 0,
      corr_varie: 80,
      cons_varie: 0,
      finanz: 0,
      pn: 60,
      totale_passivita: 1000,
    };
    const ce = { ricavi: 1000, ammortamenti: 0, oneri_fin: 40, utile: 50 };
    const r = Calc.ratingYear(sp, ce);
    assert.equal(r.s1, 3);
    assert.equal(r.s2, 3);
    assert.equal(r.s3, 3);
    assert.equal(r.s4, 3);
    assert.equal(r.rating, "AAA");
  });
};
