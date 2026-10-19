/* Eliminazione cliente: senza dati diretta, con dati serve la ragione sociale. */
const assert = require("assert");
const { api } = require("../helpers/api");
const { t } = require("../helpers/runner");

module.exports = async function () {
  await t("eliminazione cliente senza dati: diretta", async () => {
    const c = (
      await api("POST", "/clienti", {
        ragione_sociale: "Vuoto Srl",
        anno_base: 2025,
      })
    ).body;
    const d = await api("GET", `/clienti/${c.id}/dati`);
    assert.equal(d.body.ha_dati, false);
    assert.equal((await api("DELETE", `/clienti/${c.id}`)).status, 200);
    assert.equal((await api("GET", `/clienti/${c.id}`)).status, 404);
  });
  await t(
    "eliminazione cliente con dati: richiede la ragione sociale",
    async () => {
      const c = (
        await api("POST", "/clienti", {
          ragione_sociale: "Con Dati Srl",
          anno_base: 2025,
        })
      ).body;
      const v = (await api("GET", `/clienti/${c.id}/dataset`)).body.voci.find(
        (x) => x.descrizione === "CLIENTI",
      );
      await api("PUT", `/clienti/${c.id}/valore`, {
        voce_id: v.id,
        anno: 2025,
        importo: 100,
      });
      const d = await api("GET", `/clienti/${c.id}/dati`);
      assert.equal(d.body.ha_dati, true);
      assert.equal(d.body.totale, 1);
      let r = await api("DELETE", `/clienti/${c.id}`);
      assert.equal(r.status, 409);
      assert.equal(r.body.richiede_conferma, true);
      assert.equal(
        (await api("DELETE", `/clienti/${c.id}?conferma=sbagliato`)).status,
        409,
      );
      assert.equal((await api("GET", `/clienti/${c.id}`)).status, 200); // ancora presente
      assert.equal(
        (
          await api(
            "DELETE",
            `/clienti/${c.id}?conferma=${encodeURIComponent("con dati srl")}`,
          )
        ).status,
        200,
      );
      assert.equal((await api("GET", `/clienti/${c.id}`)).status, 404);
    },
  );
};
