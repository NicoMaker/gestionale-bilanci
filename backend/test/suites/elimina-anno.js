/* Eliminazione anno: senza dati diretta, con dati serve conferma. */
const assert = require("assert");
const { api } = require("../helpers/api");
const { t } = require("../helpers/runner");
const Calc = require("../../../shared/calc");

module.exports = async function ({ demo, raw }) {
  await t(
    "eliminazione anno: senza dati diretta, con dati serve conferma",
    async () => {
      const d = await api("GET", `/clienti/${demo.id}/anni/2022/dati`);
      assert.equal(d.body.ha_dati, true);
      const r = await api("DELETE", `/clienti/${demo.id}/anni/2022`);
      assert.equal(r.status, 409);
      assert.equal(r.body.richiede_conferma, true);
      assert.equal(
        (await api("GET", `/clienti/${demo.id}/anni/2022/dati`)).body.ha_dati,
        true,
      ); // non cancellato
      assert.equal(
        (await api("DELETE", `/clienti/${demo.id}/anni/2022?conferma=1`))
          .status,
        200,
      );
      const ds = Calc.buildDs(await raw());
      assert.deepEqual(Calc.anni(ds), [2023, 2024, 2025]);
      assert.equal(
        (await api("DELETE", `/clienti/${demo.id}/anni/1999`)).status,
        404,
      );
    },
  );
};
