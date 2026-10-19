/* Scrittura di un valore, persistenza e ricalcolo. */
const assert = require("assert");
const { api } = require("../helpers/api");
const { t, near } = require("../helpers/runner");
const Calc = require("../../../shared/calc");

module.exports = async function ({ demo, raw }) {
  await t("scrittura valore, persistenza e ricalcolo", async () => {
    const r0 = await raw();
    const v = r0.voci.find((x) => x.descrizione === "CLIENTI");
    assert.equal(
      (
        await api("PUT", `/clienti/${demo.id}/valore`, {
          voce_id: v.id,
          anno: 2024,
          importo: 777,
        })
      ).status,
      200,
    );
    const ds = Calc.buildDs(await raw());
    near(Calc.spYear(ds, 2024).crediti_entro, 777);
    assert.ok(Math.abs(Calc.spYear(ds, 2024).check) > 1); // ora non quadra
    await api("PUT", `/clienti/${demo.id}/valore`, {
      voce_id: v.id,
      anno: 2024,
      importo: null,
    });
    const ds2 = Calc.buildDs(await raw());
    near(Calc.spYear(ds2, 2024).crediti_entro, 0);
  });
};
