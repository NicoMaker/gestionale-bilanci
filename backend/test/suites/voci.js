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
  });

  await t("voci: eliminazione multipla, azzera valori, righe fisse eliminabili", async () => {
    const d = await raw();
    const fissa = d.voci.find((x) => x.fissa);
    const sez = fissa.sezione;
    assert.equal((await api("DELETE", `/voci/${fissa.id}`)).status, 200); // ora eliminabile
    // la sezione a riga singola ora è vuota: si può ricreare la riga, ma una sola
    const r1 = await api("POST", `/clienti/${demo.id}/voci`, { ambito: fissa.ambito, sezione: sez, descrizione: "Nuova" });
    assert.equal(r1.status, 201);
    assert.equal((await api("POST", `/clienti/${demo.id}/voci`, { ambito: fissa.ambito, sezione: sez })).status, 400);
    const a = (await api("POST", `/clienti/${demo.id}/voci`, { ambito: "CE", sezione: "C_PERSONALE", descrizione: "A" })).body;
    const b = (await api("POST", `/clienti/${demo.id}/voci`, { ambito: "CE", sezione: "C_PERSONALE", descrizione: "B" })).body;
    await api("PUT", `/clienti/${demo.id}/valore`, { voce_id: a.id, anno: 2024, importo: 10 });
    assert.equal((await api("POST", `/clienti/${demo.id}/voci/azzera`, { ids: [a.id], cosa: "valori" })).status, 200);
    let ds = await raw();
    assert.ok(ds.voci.some((x) => x.id === a.id)); // la riga resta
    assert.ok(!(ds.valori || []).some?.((x) => x.voce_id === a.id));
    assert.equal((await api("POST", `/clienti/${demo.id}/voci/azzera`, { ids: [a.id], cosa: "x" })).status, 400);
    assert.equal((await api("POST", `/clienti/${demo.id}/voci/elimina`, { ids: [] })).status, 400);
    assert.equal((await api("POST", `/clienti/${demo.id}/voci/elimina`, { ids: [a.id, 999999] })).status, 404);
    assert.equal((await api("POST", `/clienti/${demo.id}/voci/elimina`, { ids: [a.id, b.id, r1.body.id] })).status, 200);
    ds = await raw();
    assert.ok(!ds.voci.some((x) => [a.id, b.id].includes(x.id)));
  });

  await t("vendite: azzera mesi e anni", async () => {
    await api("PUT", `/clienti/${demo.id}/vendite`, { anno: 2024, mese: 3, importo: 5 });
    assert.equal((await api("POST", `/clienti/${demo.id}/vendite/azzera`, {})).status, 400);
    assert.equal((await api("POST", `/clienti/${demo.id}/vendite/azzera`, { mesi: [3] })).status, 200);
    const ds = await raw();
    const v = ds.vendite.filter((x) => x.mese === 3 && x.importo);
    assert.equal(v.length, 0);
  });
};
