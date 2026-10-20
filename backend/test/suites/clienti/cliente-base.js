/* Creazione cliente con struttura di partenza e validazioni di base. */
const assert = require("assert");
const { api } = require("../../helpers/api");
const { t } = require("../../helpers/runner");

module.exports = async function () {
  await t("crea cliente + struttura di partenza", async () => {
    const r = await api("POST", "/clienti", {
      ragione_sociale: "Test Srl",
      anno_base: 2024,
    });
    assert.equal(r.status, 201);
    const ds = await api("GET", `/clienti/${r.body.id}/dataset`);
    assert.ok(ds.body.voci.length >= 80);
    // esercizi automatici: dall'anno impostato fino all'ultimo esercizio chiuso (anno corrente − 1)
    const attesi = [];
    for (let a = 2024; a <= Math.max(2024, new Date().getFullYear() - 1); a++)
      attesi.push(a);
    assert.deepEqual(
      ds.body.parametri.map((p) => p.anno),
      attesi,
    );
  });
  await t("validazioni", async () => {
    assert.equal(
      (await api("POST", "/clienti", { ragione_sociale: "", anno_base: 2024 }))
        .status,
      400,
    );
    assert.equal(
      (await api("POST", "/clienti", { ragione_sociale: "X", anno_base: 1800 }))
        .status,
      400,
    );
    assert.equal((await api("GET", "/clienti/9999")).status, 404);
  });
};
