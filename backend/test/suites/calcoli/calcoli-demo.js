/* Cliente demo: stato patrimoniale in pareggio, rating, budget e cash flow calcolati. */
const assert = require("assert");
const { t, near } = require("../../helpers/runner");
const Calc = require("../../../../shared/calc");

module.exports = async function ({ demo, raw }) {
  await t(
    "demo: stato patrimoniale in pareggio (check = 0) e rating",
    async () => {
      const ds = Calc.buildDs(await raw());
      for (const a of [2022, 2023, 2024, 2025]) {
        const d = Calc.yearData(ds, a);
        near(d.sp.check, 0);
        assert.equal(d.rating.rating, "AAA");
      }
      near(Calc.ceYear(ds, 2024).utile, 221000);
      assert.ok(Calc.ceYear(ds, 2025).utile > 250000);
      assert.deepEqual(Calc.anni(ds), [2022, 2023, 2024, 2025]);
      const R = Calc.compute(ds, 2025); // budget 2026 + cash flow 2026 calcolati dall'anno 2025
      assert.ok(
        R.bud.H.ricavi > 2500000 &&
          R.cf.liq[11] > 0 &&
          R.bep.rows.length === 13,
      );
      // tutti gli esercizi in colonna: quelli con dati + la finestra di 3 anni, ciascuno già calcolato
      assert.deepEqual(R.tutti, [2022, 2023, 2024, 2025]);
      assert.deepEqual(R.years, [2023, 2024, 2025]);
      assert.ok(
        R.tutti.every((a) => R.anni[a] && R.anni[a].sp && R.anni[a].ce),
      );
      const R22 = Calc.compute(ds, 2022); // anno di riferimento più vecchio: gli anni successivi restano visibili
      assert.deepEqual(R22.tutti, [2020, 2021, 2022, 2023, 2024, 2025]);
    },
  );
};
