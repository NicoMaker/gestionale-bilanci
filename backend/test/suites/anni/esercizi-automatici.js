/* Aggiornamento automatico degli esercizi: dall'anno impostato fino all'ultimo esercizio chiuso. */
const assert = require("assert");
const { api } = require("../../helpers/api");
const { t } = require("../../helpers/runner");
const {
  sincronizzaCliente,
  sincronizzaTutti,
  ultimoEsercizioChiuso,
} = require("../../../src/modules/anni/service");
const { getCliente } = require("../../../src/modules/clienti/service");

const anniDi = async (id) =>
  (await api("GET", "/clienti")).body.find((c) => c.id === id).anni;

module.exports = async function () {
  const chiuso = ultimoEsercizioChiuso();

  await t(
    "creazione cliente: esercizi da anno impostato a ultimo chiuso",
    async () => {
      const base = chiuso - 2;
      const c = (
        await api("POST", "/clienti", {
          ragione_sociale: "Auto Esercizi Srl",
          anno_base: base,
        })
      ).body;
      assert.deepEqual(await anniDi(c.id), [base, base + 1, base + 2]);
      await api("DELETE", `/clienti/${c.id}`);
    },
  );

  await t("anno impostato recente: nessun esercizio extra", async () => {
    const c = (
      await api("POST", "/clienti", {
        ragione_sociale: "Anno Recente Srl",
        anno_base: chiuso,
      })
    ).body;
    assert.deepEqual(await anniDi(c.id), [chiuso]);
    await api("DELETE", `/clienti/${c.id}`);
  });

  await t(
    "cambio anno: si aggiungono solo i nuovi esercizi, senza duplicati",
    async () => {
      const c = (
        await api("POST", "/clienti", {
          ragione_sociale: "Cambio Anno Srl",
          anno_base: chiuso,
        })
      ).body;
      // simulo il passaggio a due anni dopo
      sincronizzaTutti(chiuso + 2);
      assert.deepEqual(await anniDi(c.id), [chiuso, chiuso + 1, chiuso + 2]);
      // seconda esecuzione: nulla da creare
      assert.equal(sincronizzaTutti(chiuso + 2), 0);
      await api("DELETE", `/clienti/${c.id}`);
    },
  );

  await t("anno eliminato a mano nel mezzo: non viene ricreato", async () => {
    const base = chiuso - 3;
    const c = (
      await api("POST", "/clienti", {
        ragione_sociale: "Buco Srl",
        anno_base: base,
      })
    ).body;
    assert.equal(
      (await api("DELETE", `/clienti/${c.id}/anni/${base + 1}`)).status,
      200,
    );
    sincronizzaCliente(getCliente(c.id));
    assert.ok(!(await anniDi(c.id)).includes(base + 1));
    await api("DELETE", `/clienti/${c.id}`);
  });
};
