/* Budget: fattori per tipo riga e variazioni manuali (regola Excel). */
const assert = require("assert");
const { t, near } = require("../helpers/runner");
const Calc = require("../../shared/calc");

module.exports = async function ({ raw }) {
  await t(
    "budget: fattori per tipo e variazioni manuali (regola Excel)",
    async () => {
      const ds = Calc.buildDs(await raw());
      const b = Calc.budget(ds, 2024);
      const vend = ds.voci.find((v) => v.descrizione === "Vendite prodotti");
      near(b.righe[vend.id].F, 1.02 * 1.01, 1e-9); // IP
      near(b.righe[vend.id].H, 2100000 * 1.02 * 1.01, 0.01);
      const serv = ds.voci.find(
        (v) => v.descrizione === "Prestazioni di servizi",
      );
      near(b.righe[serv.id].H, 230000 * 1.1, 0.01); // decimale → moltiplicatore
      const pub = ds.voci.find((v) => v.descrizione === "Pubblicità");
      near(b.righe[pub.id].H, 25000 + 5000, 0.01); // intero → somma
      assert.equal(Calc.fattore("z", 2, 1), 0);
      assert.equal(Calc.fattore("O", 2, 1), 1);
    },
  );
};
