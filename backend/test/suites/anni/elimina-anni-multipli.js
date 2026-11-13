/* Eliminazione di più anni dello stesso cliente (selezione multipla). */
const assert = require("assert");
const { api } = require("../../helpers/api");
const { t } = require("../../helpers/runner");

module.exports = async function () {
  const nuovo = async (nome, annoBase = 2021) =>
    (
      await api("POST", "/clienti", {
        ragione_sociale: nome,
        anno_base: annoBase,
      })
    ).body;
  const anniDi = async (id) =>
    (await api("GET", "/clienti")).body
      .find((c) => c.id === id)
      .anni.slice()
      .sort();
  const url = (id) => `/clienti/${id}/anni/elimina-multiplo`;

  await t("elimina più anni senza dati: diretta", async () => {
    const c = await nuovo("Anni A Srl");
    const prima = await anniDi(c.id);
    assert.ok(prima.length >= 4);
    const [a, b] = prima;
    const r = await api("POST", url(c.id), { anni: [a, b] });
    assert.equal(r.status, 200);
    assert.equal(r.body.eliminati, 2);
    assert.deepEqual(await anniDi(c.id), prima.slice(2));
  });

  await t(
    "elimina più anni con dati: anteprima, conferma richiesta, poi eliminati",
    async () => {
      const c = await nuovo("Anni B Srl");
      const prima = await anniDi(c.id);
      const v = (await api("GET", `/clienti/${c.id}/dataset`)).body.voci.find(
        (x) => x.descrizione === "CLIENTI",
      );
      await api("PUT", `/clienti/${c.id}/valore`, {
        voce_id: v.id,
        anno: prima[1],
        importo: 50,
      });
      const sel = [prima[0], prima[1]];

      const prev = await api("POST", url(c.id), { anni: sel, anteprima: true });
      assert.equal(prev.status, 200);
      assert.equal(prev.body.con_dati.length, 1);
      assert.equal(prev.body.con_dati[0].anno, prima[1]);
      assert.equal(prev.body.senza_dati, 1);
      assert.deepEqual(await anniDi(c.id), prima); // l'anteprima non cancella

      const senza = await api("POST", url(c.id), { anni: sel });
      assert.equal(senza.status, 409);
      assert.equal(senza.body.richiede_conferma, true);
      assert.deepEqual(await anniDi(c.id), prima); // senza conferma non cancella

      const ok = await api("POST", url(c.id), { anni: sel, conferma: 1 });
      assert.equal(ok.status, 200);
      assert.equal(ok.body.eliminati, 2);
      assert.deepEqual(await anniDi(c.id), prima.slice(2));

      // ogni anno eliminato è nel cestino
      const { elementi } = (await api("GET", "/cestino")).body;
      assert.ok(elementi.filter((x) => x.tipo === "anno").length >= 2);
    },
  );

  await t("elimina più anni: validazioni e atomicità", async () => {
    const c = await nuovo("Anni C Srl");
    const prima = await anniDi(c.id);
    assert.equal((await api("POST", url(c.id), { anni: [] })).status, 400);
    assert.equal((await api("POST", url(c.id), {})).status, 400);
    assert.equal(
      (await api("POST", url(c.id), { anni: ["abc"] })).status,
      400,
    );
    // un anno inesistente: non viene eliminato nulla
    const inex = await api("POST", url(c.id), { anni: [prima[0], 1999] });
    assert.equal(inex.status, 404);
    assert.deepEqual(await anniDi(c.id), prima);
    // non si possono eliminare tutti gli anni
    const tutti = await api("POST", url(c.id), { anni: prima });
    assert.equal(tutti.status, 400);
    assert.deepEqual(await anniDi(c.id), prima);
    // cliente inesistente
    assert.equal(
      (await api("POST", url(999999), { anni: [prima[0]] })).status,
      404,
    );
    // duplicati ignorati: l'anno viene eliminato una volta sola
    const dup = await api("POST", url(c.id), { anni: [prima[0], prima[0]] });
    assert.equal(dup.status, 200);
    assert.equal(dup.body.eliminati, 1);
  });
};
