/* Eliminazione del cliente demo con tutti i dati, dopo conferma. */
const assert = require("assert");
const { api } = require("../../helpers/api");
const { t } = require("../../helpers/runner");

module.exports = async function ({ demo }) {
  await t("elimina cliente demo (con tutti i dati) dopo conferma", async () => {
    assert.equal((await api("DELETE", `/clienti/${demo.id}`)).status, 409);
    assert.equal(
      (
        await api(
          "DELETE",
          `/clienti/${demo.id}?conferma=${encodeURIComponent("Azienda Demo S.r.l.")}`,
        )
      ).status,
      200,
    );
    assert.equal((await api("GET", `/clienti/${demo.id}`)).status, 404);
    assert.equal((await api("POST", "/demo")).status, 201); // ora si può ricreare
  });
};
