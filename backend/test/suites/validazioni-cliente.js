/* Validazioni cliente: P.IVA, duplicati, demo già presente, numeri. */
const assert = require("assert");
const { api } = require("../helpers/api");
const { t } = require("../helpers/runner");

module.exports = async function ({ demo, raw }) {
  await t(
    "validazioni cliente: P.IVA, duplicati, demo già presente, numeri",
    async () => {
      assert.equal(
        (
          await api("POST", "/clienti", {
            ragione_sociale: "Altro",
            partita_iva: "123",
            anno_base: 2024,
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await api("POST", "/clienti", {
            ragione_sociale: "  test SRL ",
            anno_base: 2024,
          })
        ).status,
        409,
      ); // duplicato (case/spazi)
      assert.equal(
        (
          await api("POST", "/clienti", {
            ragione_sociale: "Altro",
            partita_iva: "01234567890",
            anno_base: 2024,
          })
        ).status,
        409,
      ); // P.IVA già usata
      assert.equal((await api("POST", "/demo")).status, 409);
      const v = (await raw()).voci.find((x) => x.descrizione === "CLIENTI");
      assert.equal(
        (
          await api("PUT", `/clienti/${demo.id}/valore`, {
            voce_id: v.id,
            anno: 2024,
            importo: 1e15,
          })
        ).status,
        400,
      );
    },
  );
};
