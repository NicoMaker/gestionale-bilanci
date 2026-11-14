/* Modifica dell'anno base del cliente: ammesso solo tra gli esercizi già creati. */
const assert = require("assert");
const { api } = require("../../helpers/api");
const { t } = require("../../helpers/runner");

module.exports = async function () {
  const nuovo = async (nome, anno_base) =>
    (await api("POST", "/clienti", { ragione_sociale: nome, anno_base })).body;

  await t("anno base: modificabile solo con un esercizio creato", async () => {
    const c = await nuovo("Anno Base Srl", 2030);
    await api("POST", `/clienti/${c.id}/anni/multiplo`, { da: 2031, a: 2033 });
    let r = await api("PUT", `/clienti/${c.id}`, {
      ragione_sociale: "Anno Base Srl",
      anno_base: 2032,
    });
    assert.equal(r.status, 200);
    assert.equal(r.body.anno_base, 2032);
    // anno non creato → rifiutato e anno base invariato
    r = await api("PUT", `/clienti/${c.id}`, { anno_base: 2020 });
    assert.equal(r.status, 400);
    assert.match(r.body.error, /esercizi già creati/);
    assert.equal((await api("GET", `/clienti/${c.id}`)).body.anno_base, 2032);
    assert.equal(
      (await api("PUT", `/clienti/${c.id}`, { anno_base: "x" })).status,
      400,
    );
    // senza anno_base nel body: resta com'è
    r = await api("PUT", `/clienti/${c.id}`, { note: "ciao" });
    assert.equal(r.body.anno_base, 2032);
    await api("DELETE", `/clienti/${c.id}`);
  });

  await t("anno base eliminato: passa al primo esercizio rimasto", async () => {
    const c = await nuovo("Anno Base Del Srl", 2030);
    await api("POST", `/clienti/${c.id}/anni/multiplo`, { da: 2031, a: 2032 });
    await api("PUT", `/clienti/${c.id}`, { anno_base: 2031 });
    const r = await api("DELETE", `/clienti/${c.id}/anni/2031`);
    assert.equal(r.status, 200);
    assert.equal((await api("GET", `/clienti/${c.id}`)).body.anno_base, 2030);
    await api("DELETE", `/clienti/${c.id}`);
  });
};
