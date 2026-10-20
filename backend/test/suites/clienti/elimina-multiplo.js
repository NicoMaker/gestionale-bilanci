/* Eliminazione di più clienti selezionati. */
const assert = require("assert");
const { api } = require("../../helpers/api");
const { t } = require("../../helpers/runner");

module.exports = async function () {
  const nuovo = async (nome) =>
    (await api("POST", "/clienti", { ragione_sociale: nome, anno_base: 2025 }))
      .body;
  const esiste = async (id) =>
    (await api("GET", `/clienti/${id}`)).status === 200;

  await t("elimina multiplo senza dati: diretta", async () => {
    const a = await nuovo("Del A Srl");
    const b = await nuovo("Del B Srl");
    const r = await api("POST", "/clienti/elimina-multiplo", {
      ids: [a.id, b.id],
    });
    assert.equal(r.status, 200);
    assert.equal(r.body.eliminati, 2);
    assert.ok(!(await esiste(a.id)) && !(await esiste(b.id)));
  });

  await t(
    "elimina multiplo con dati: anteprima, conferma richiesta, poi eliminati",
    async () => {
      const a = await nuovo("Del C Srl");
      const b = await nuovo("Del D Srl");
      const v = (await api("GET", `/clienti/${a.id}/dataset`)).body.voci.find(
        (x) => x.descrizione === "CLIENTI",
      );
      await api("PUT", `/clienti/${a.id}/valore`, {
        voce_id: v.id,
        anno: 2025,
        importo: 50,
      });

      const prev = await api("POST", "/clienti/elimina-multiplo", {
        ids: [a.id, b.id],
        anteprima: true,
      });
      assert.equal(prev.status, 200);
      assert.equal(prev.body.con_dati.length, 1);
      assert.equal(prev.body.senza_dati, 1);
      assert.ok((await esiste(a.id)) && (await esiste(b.id))); // l'anteprima non elimina

      let r = await api("POST", "/clienti/elimina-multiplo", {
        ids: [a.id, b.id],
      });
      assert.equal(r.status, 409);
      r = await api("POST", "/clienti/elimina-multiplo", {
        ids: [a.id, b.id],
        conferma: "no",
      });
      assert.equal(r.status, 409);
      assert.ok((await esiste(a.id)) && (await esiste(b.id)));

      r = await api("POST", "/clienti/elimina-multiplo", {
        ids: [a.id, b.id],
        conferma: "elimina",
      });
      assert.equal(r.status, 200);
      assert.ok(!(await esiste(a.id)) && !(await esiste(b.id)));
    },
  );

  await t("elimina multiplo: validazioni e atomicità", async () => {
    const a = await nuovo("Del E Srl");
    assert.equal(
      (await api("POST", "/clienti/elimina-multiplo", { ids: [] })).status,
      400,
    );
    assert.equal(
      (await api("POST", "/clienti/elimina-multiplo", { ids: [a.id, 999999] }))
        .status,
      404,
    );
    assert.ok(await esiste(a.id));
    await api("DELETE", `/clienti/${a.id}`);
  });
};
