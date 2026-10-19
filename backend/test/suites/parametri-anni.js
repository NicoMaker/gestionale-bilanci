/* Parametri, vendite, cash flow e anni. */
const assert = require("assert");
const { api } = require("../helpers/api");
const { t, near } = require("../helpers/runner");
const Calc = require("../../shared/calc");

module.exports = async function ({ demo, raw }) {
  await t("parametri, vendite, cash flow, anni", async () => {
    assert.equal(
      (
        await api("PUT", `/clienti/${demo.id}/parametri`, {
          anno: 2024,
          campo: "inflazione",
          valore: 3,
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await api("PUT", `/clienti/${demo.id}/parametri`, {
          anno: 2024,
          campo: "drop table",
          valore: 3,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await api("PUT", `/clienti/${demo.id}/vendite`, {
          anno: 2024,
          mese: 13,
          importo: 1,
        })
      ).status,
      400,
    );
    const ds = Calc.buildDs(await raw());
    near(ds.par[2024].inflazione, 3);
    const cf = Calc.cashflow(ds, 2024);
    near(cf.liq[11], cf.saldo[11] + cf.entrate[11] + cf.uscite[11]);
    near(cf.saldo[1], cf.liq[0]);
    assert.equal(
      (await api("POST", `/clienti/${demo.id}/anni`, {})).body.anno,
      2026,
    );
    assert.equal(
      (await api("DELETE", `/clienti/${demo.id}/anni/2026`)).status,
      200,
    ); // anno vuoto: eliminazione diretta
  });
};
