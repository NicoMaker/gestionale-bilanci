/* «Tutti i clienti»: basta UN solo dato inserito perché il cliente compaia con quel dato (non serve riempire attivo e ricavi). */
const assert = require("assert");
const { api } = require("../../helpers/api");
const { t, near } = require("../../helpers/runner");

module.exports = async function () {
  const nuovo = async (nome) => {
    const r = await api("POST", "/clienti", {
      ragione_sociale: nome,
      anno_base: 2024,
    });
    assert.equal(r.status, 201);
    return r.body.id;
  };
  const riga = async (id) =>
    (await api("GET", "/statistiche")).body.clienti.find((c) => c.id === id);

  await t(
    "un solo dato di conto economico: il cliente non risulta vuoto",
    async () => {
      const id = await nuovo("Un Solo Costo Srl");
      assert.equal((await riga(id)).vuoto, true, "senza dati è vuoto");

      const ds = (await api("GET", `/clienti/${id}/dataset`)).body;
      const costo = ds.voci.find(
        (v) => v.ambito === "CE" && v.sezione.startsWith("C_"),
      );
      assert.ok(costo, "esiste una riga di costo");
      const put = await api("PUT", `/clienti/${id}/valore`, {
        voce_id: costo.id,
        anno: 2024,
        importo: 1500,
      });
      assert.equal(put.status, 200);

      const r = await riga(id);
      assert.equal(r.vuoto, false, "un solo valore basta");
      assert.equal(r.anno, 2024);
      const tot = (await api("GET", "/statistiche")).body.totali;
      assert.ok(tot.clienti_con_dati >= 1);
    },
  );

  await t(
    "una sola vendita mensile: il cliente non risulta vuoto",
    async () => {
      const id = await nuovo("Una Sola Vendita Srl");
      const put = await api("PUT", `/clienti/${id}/vendite`, {
        anno: 2024,
        mese: 3,
        importo: 800,
      });
      assert.equal(put.status, 200);
      assert.equal((await riga(id)).vuoto, false);
    },
  );

  await t("azzerando l'unico dato il cliente torna vuoto", async () => {
    const id = await nuovo("Poi Azzerato Srl");
    await api("PUT", `/clienti/${id}/vendite`, {
      anno: 2024,
      mese: 1,
      importo: 50,
    });
    assert.equal((await riga(id)).vuoto, false);
    await api("PUT", `/clienti/${id}/vendite`, {
      anno: 2024,
      mese: 1,
      importo: null,
    });
    const r = await riga(id);
    assert.equal(r.vuoto, true);
    near(r.ricavi, 0);
  });
};
