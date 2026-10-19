/* Righe di conto: aggiunta, rinomina, tipo non valido, eliminazione. */
const assert = require("assert");
const { api } = require("../helpers/api");
const { t } = require("../helpers/runner");

module.exports = async function ({ demo, raw }) {
  await t("voci: aggiungi, rinomina, tipo non valido, elimina", async () => {
    const a = await api("POST", `/clienti/${demo.id}/voci`, {
      ambito: "CE",
      sezione: "C_PERSONALE",
      descrizione: "Nuova voce",
      tipo: "V",
    });
    assert.equal(a.status, 201);
    assert.equal(
      (await api("PUT", `/voci/${a.body.id}`, { tipo: "ZZ" })).status,
      400,
    );
    assert.equal(
      (await api("PUT", `/voci/${a.body.id}`, { descrizione: "Rinominata" }))
        .body.descrizione,
      "Rinominata",
    );
    assert.equal(
      (
        await api("POST", `/clienti/${demo.id}/voci`, {
          ambito: "CE",
          sezione: "C_RIM_INIZ",
        })
      ).status,
      400,
    ); // sezione a riga singola
    assert.equal((await api("DELETE", `/voci/${a.body.id}`)).status, 200);
    const fissa = (await raw()).voci.find((x) => x.fissa);
    assert.equal((await api("DELETE", `/voci/${fissa.id}`)).status, 400);
  });
};
