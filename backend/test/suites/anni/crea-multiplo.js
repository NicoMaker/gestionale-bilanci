/* Creazione dell'esercizio di un altro anno per più clienti. */
const assert = require("assert");
const { api } = require("../../helpers/api");
const { t } = require("../../helpers/runner");

module.exports = async function () {
  const nuovo = async (nome, anno_base) =>
    (await api("POST", "/clienti", { ragione_sociale: nome, anno_base })).body;

  await t("crea anno per più clienti: crea e salta chi lo ha già", async () => {
    const a = await nuovo("Multi A Srl", 2025);
    const b = await nuovo("Multi B Srl", 2025);
    await api("POST", `/clienti/${b.id}/anni`, { anno: 2040 });
    const r = await api("POST", "/anni/bulk", {
      cliente_ids: [a.id, b.id],
      anno: 2040,
    });
    assert.equal(r.status, 201);
    assert.equal(r.body.creati, 1);
    assert.equal(r.body.saltati, 1);
    const lista = (await api("GET", "/clienti")).body;
    for (const c of [a, b])
      assert.ok(lista.find((x) => x.id === c.id).anni.includes(2040));
    for (const c of [a, b]) await api("DELETE", `/clienti/${c.id}`);
  });

  await t("crea anno multiplo: validazioni e atomicità", async () => {
    const a = await nuovo("Multi C Srl", 2025);
    assert.equal(
      (await api("POST", "/anni/bulk", { cliente_ids: [], anno: 2030 })).status,
      400,
    );
    assert.equal(
      (await api("POST", "/anni/bulk", { cliente_ids: [a.id], anno: 1800 }))
        .status,
      400,
    );
    // un id inesistente blocca tutto: nessun anno creato
    assert.equal(
      (
        await api("POST", "/anni/bulk", {
          cliente_ids: [a.id, 999999],
          anno: 2031,
        })
      ).status,
      404,
    );
    const c = (await api("GET", "/clienti")).body.find((x) => x.id === a.id);
    assert.ok(!c.anni.includes(2031));
    await api("DELETE", `/clienti/${a.id}`);
  });
};
