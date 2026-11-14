/* Creazione di più esercizi in un colpo (un cliente o più clienti) e lista anni del cliente appena creato. */
const assert = require("assert");
const { api } = require("../../helpers/api");
const { t } = require("../../helpers/runner");
const Calc = require("../../../../shared/calc");

module.exports = async function () {
  const nuovo = async (nome, anno_base) =>
    (await api("POST", "/clienti", { ragione_sociale: nome, anno_base })).body;
  const parametri = async (id) =>
    (await api("GET", `/clienti/${id}/dataset`)).body.parametri;
  const anniDi = async (id) =>
    (await api("GET", "/clienti")).body.find((c) => c.id === id).anni;

  await t(
    "cliente dell'anno corrente: nella lista solo i suoi anni (niente anni precedenti inventati)",
    async () => {
      const corrente = new Date().getFullYear();
      const c = await nuovo("Anno Corrente Srl", corrente);
      assert.deepEqual(await anniDi(c.id), [corrente]);
      const raw = (await api("GET", `/clienti/${c.id}/dataset`)).body;
      const ds = Calc.buildDs(raw);
      const R = Calc.compute(ds, corrente);
      assert.deepEqual(R.tutti, [corrente]);
      assert.deepEqual(R.years, [corrente]);
      assert.deepEqual(Object.keys(R.anni).map(Number), [corrente]);
      await api("DELETE", `/clienti/${c.id}`);
    },
  );

  await t("più anni insieme (intervallo) per un cliente", async () => {
    const c = await nuovo("Piu Anni A Srl", 2030);
    await api("POST", `/clienti/${c.id}/anni`, { anno: 2033 });
    const r = await api("POST", `/clienti/${c.id}/anni/multiplo`, {
      da: 2031,
      a: 2035,
    });
    assert.equal(r.status, 201);
    assert.deepEqual(r.body.creati, [2031, 2032, 2034, 2035]);
    assert.deepEqual(r.body.saltati, [2033]);
    assert.deepEqual(await anniDi(c.id), [
      2030, 2031, 2032, 2033, 2034, 2035,
    ]);
    const p = await parametri(c.id);
    for (const x of p)
      assert.equal(x.data_chiusura, `${x.anno}-12-31`, "31/12 se non indicata");
    await api("DELETE", `/clienti/${c.id}`);
  });

  await t(
    "più anni insieme: elenco di anni e stessa data (gg/mm) per tutti",
    async () => {
      const c = await nuovo("Piu Anni B Srl", 2030);
      const r = await api("POST", `/clienti/${c.id}/anni/multiplo`, {
        anni: [2036, 2034, 2036, 2038],
        giorno_mese: "30/06",
      });
      assert.equal(r.status, 201);
      assert.deepEqual(r.body.anni, [2034, 2036, 2038]);
      const p = await parametri(c.id);
      for (const a of [2034, 2036, 2038])
        assert.equal(
          p.find((x) => x.anno === a).data_chiusura,
          `${a}-06-30`,
        );
      // un solo anno + data_chiusura completa: regola di sempre
      const u = await api("POST", `/clienti/${c.id}/anni/multiplo`, {
        da: 2040,
        data_chiusura: "2040-09-30",
      });
      assert.equal(u.status, 201);
      assert.equal(u.body.date[2040], "2040-09-30");
      await api("DELETE", `/clienti/${c.id}`);
    },
  );

  await t("29/02 negli anni non bisestili diventa 28/02", async () => {
    const c = await nuovo("Bisestile Srl", 2030);
    const r = await api("POST", `/clienti/${c.id}/anni/multiplo`, {
      da: 2031,
      a: 2032,
      giorno_mese: "29/02",
    });
    assert.equal(r.status, 201);
    assert.equal(r.body.date[2031], "2031-02-28");
    assert.equal(r.body.date[2032], "2032-02-29");
    await api("DELETE", `/clienti/${c.id}`);
  });

  await t("più anni insieme: validazioni e atomicità", async () => {
    const c = await nuovo("Piu Anni C Srl", 2030);
    const prima = await anniDi(c.id);
    const url = `/clienti/${c.id}/anni/multiplo`;
    assert.equal((await api("POST", url, { da: 2035, a: 2033 })).status, 400);
    assert.equal((await api("POST", url, { da: 1980, a: 1985 })).status, 400);
    assert.equal((await api("POST", url, { da: 2090, a: 2110 })).status, 400);
    assert.equal((await api("POST", url, { da: 2000, a: 2070 })).status, 400);
    assert.equal((await api("POST", url, { anni: [] })).status, 400);
    assert.equal((await api("POST", url, { anni: [2035, "x"] })).status, 400);
    assert.equal(
      (await api("POST", url, { da: 2035, a: 2036, giorno_mese: "31/04" }))
        .status,
      400,
    );
    assert.equal(
      (await api("POST", url, { da: 2035, a: 2036, giorno_mese: "boh" }))
        .status,
      400,
    );
    assert.equal((await api("POST", "/clienti/999999/anni/multiplo", { da: 2035 })).status, 404);
    assert.deepEqual(await anniDi(c.id), prima, "nessun anno creato");
    await api("DELETE", `/clienti/${c.id}`);
  });

  await t("più anni per più clienti insieme", async () => {
    const a = await nuovo("Piu Clienti A Srl", 2030);
    const b = await nuovo("Piu Clienti B Srl", 2030);
    await api("POST", `/clienti/${b.id}/anni`, { anno: 2032 });
    const r = await api("POST", "/anni/bulk", {
      cliente_ids: [a.id, b.id],
      da: 2031,
      a: 2033,
      giorno_mese: "31/03",
    });
    assert.equal(r.status, 201);
    assert.equal(r.body.creati, 5); // a: 3 anni, b: 2 anni (2032 c'era già)
    assert.equal(r.body.saltati, 1);
    assert.deepEqual(r.body.dettaglio.find((d) => d.id === b.id).saltati, [
      2032,
    ]);
    assert.deepEqual(await anniDi(a.id), [2030, 2031, 2032, 2033]);
    assert.equal(
      (await parametri(a.id)).find((x) => x.anno === 2033).data_chiusura,
      "2033-03-31",
    );
    for (const c of [a, b]) await api("DELETE", `/clienti/${c.id}`);
  });

  await t("date diverse: per anno (stesso per tutti) e per singolo cliente/anno", async () => {
    const a = await nuovo("Date Diverse A Srl", 2030);
    const b = await nuovo("Date Diverse B Srl", 2030);
    const r = await api("POST", "/anni/bulk", {
      cliente_ids: [a.id, b.id],
      da: 2031,
      a: 2033,
      giorno_mese: "31/03", // base per tutti
      date: { 2032: "2032-06-30" }, // il 2032 chiude il 30/06 per tutti
      date_clienti: { [b.id]: { 2031: "2031-09-30", 2033: "" } }, // solo B nel 2031; vuoto = livello successivo
    });
    assert.equal(r.status, 201);
    const d = async (id) =>
      Object.fromEntries((await parametri(id)).map((x) => [x.anno, x.data_chiusura]));
    assert.deepEqual(await d(a.id), {
      2030: "2030-12-31",
      2031: "2031-03-31",
      2032: "2032-06-30",
      2033: "2033-03-31",
    });
    assert.deepEqual(await d(b.id), {
      2030: "2030-12-31",
      2031: "2031-09-30",
      2032: "2032-06-30",
      2033: "2033-03-31",
    });
    // senza nessuna indicazione resta il 31/12 automatico
    const x = await api("POST", `/clienti/${a.id}/anni/multiplo`, { da: 2034, a: 2035, date: { 2035: "2035-02-15" } });
    assert.equal(x.body.date[2034], "2034-12-31");
    assert.equal(x.body.date[2035], "2035-02-15");
    // data fuori dall'anno → 400 e nulla creato
    const prima = await anniDi(b.id);
    assert.equal(
      (await api("POST", "/anni/bulk", { cliente_ids: [b.id], da: 2036, a: 2037, date_clienti: { [b.id]: { 2037: "2036-05-01" } } })).status,
      400,
    );
    assert.equal((await api("POST", `/clienti/${b.id}/anni/multiplo`, { da: 2036, date: { 2036: "2035-05-01" } })).status, 400);
    assert.deepEqual(await anniDi(b.id), prima);
    for (const c of [a, b]) await api("DELETE", `/clienti/${c.id}`);
  });
};
