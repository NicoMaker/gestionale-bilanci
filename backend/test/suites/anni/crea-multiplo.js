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

  await t("data di chiusura dell'esercizio: 31/12 se non indicata", async () => {
    const dataDi = async (cid, anno) =>
      (await api("GET", `/clienti/${cid}/dataset`)).body.parametri.find(
        (p) => p.anno === anno,
      ).data_chiusura;
    const a = await nuovo("Data A Srl", 2025);
    const b = await nuovo("Data B Srl", 2025);
    // senza data: 31/12 dell'anno
    let r = await api("POST", "/anni/bulk", { cliente_ids: [a.id], anno: 2041 });
    assert.equal(r.body.data_chiusura, "2041-12-31");
    assert.equal(await dataDi(a.id, 2041), "2041-12-31");
    // con data (ISO o GG/MM/AAAA)
    r = await api("POST", "/anni/bulk", {
      cliente_ids: [a.id, b.id],
      anno: 2042,
      data_chiusura: "2042-06-30",
    });
    assert.equal(r.status, 201);
    assert.equal(await dataDi(a.id, 2042), "2042-06-30");
    assert.equal(await dataDi(b.id, 2042), "2042-06-30");
    r = await api("POST", `/clienti/${a.id}/anni`, {
      anno: 2043,
      data_chiusura: "30/09/2043",
    });
    assert.equal(r.body.data_chiusura, "2043-09-30");
    // anno aggiunto senza indicazioni e anni creati in automatico: 31/12
    r = await api("POST", `/clienti/${a.id}/anni`, {});
    assert.equal(r.body.data_chiusura, `${r.body.anno}-12-31`);
    assert.equal(await dataDi(a.id, 2025), "2025-12-31");
    // un anno già presente non viene modificato
    await api("POST", "/anni/bulk", {
      cliente_ids: [a.id],
      anno: 2042,
      data_chiusura: "2042-03-31",
    });
    assert.equal(await dataDi(a.id, 2042), "2042-06-30");
    // date non valide
    for (const data_chiusura of ["2042-02-30", "abc", "2043-06-30", "31/13/2042"])
      assert.equal(
        (
          await api("POST", "/anni/bulk", {
            cliente_ids: [b.id],
            anno: 2042,
            data_chiusura,
          })
        ).status,
        400,
        data_chiusura,
      );
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

  await t("data di chiusura: modifica di un esercizio esistente", async () => {
    const c = await nuovo("Data C Srl", 2025);
    const dataDi = async (anno) =>
      (await api("GET", `/clienti/${c.id}/dataset`)).body.parametri.find(
        (p) => p.anno === anno,
      ).data_chiusura;
    const url = `/clienti/${c.id}/anni/2025/data-chiusura`;
    assert.equal(await dataDi(2025), "2025-12-31");
    let r = await api("PUT", url, { data_chiusura: "30/06/2025" });
    assert.equal(r.status, 200);
    assert.equal(await dataDi(2025), "2025-06-30");
    // vuota = torna al 31/12
    r = await api("PUT", url, { data_chiusura: "" });
    assert.equal(r.body.data_chiusura, "2025-12-31");
    assert.equal(await dataDi(2025), "2025-12-31");
    // data di un altro anno o non valida: rifiutata
    for (const data_chiusura of ["2024-06-30", "2025-02-30", "abc"])
      assert.equal((await api("PUT", url, { data_chiusura })).status, 400);
    assert.equal(await dataDi(2025), "2025-12-31");
    await api("DELETE", `/clienti/${c.id}`);
  });
};
