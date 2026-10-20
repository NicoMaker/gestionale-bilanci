/* Cestino: ogni eliminazione/azzeramento si può ripristinare entro 15 giorni; poi sparisce. */
const assert = require("assert");
const db = require("../../../src/core/db");
const { api } = require("../../helpers/api");
const { t } = require("../../helpers/runner");

const nuovoCliente = async (nome) =>
  (await api("POST", "/clienti", { ragione_sociale: nome, anno_base: 2025 })).body;
const dataset = async (id) => (await api("GET", `/clienti/${id}/dataset`)).body;
const trovaVoce = (ds, descr) => ds.voci.find((x) => x.descrizione === descr);
const cestino = async () => (await api("GET", "/cestino")).body;
const ultimo = async () => (await cestino()).elementi[0];
const ripristina = (...ids) => api("POST", "/cestino/ripristina", { ids });

module.exports = async function () {
  await t("cestino: riga eliminata → ripristinata con i suoi valori", async () => {
    const c = await nuovoCliente("Cestino Righe Srl");
    const v = trovaVoce(await dataset(c.id), "CLIENTI");
    await api("PUT", `/clienti/${c.id}/valore`, { voce_id: v.id, anno: 2025, importo: 777 });
    await api("DELETE", `/voci/${v.id}`);
    const it = await ultimo();
    assert.equal(it.tipo, "voci");
    assert.equal(it.giorni_rimasti, 15);
    assert.equal(it.n_dati, 1);
    assert.ok(!trovaVoce(await dataset(c.id), "CLIENTI"));
    assert.equal((await ripristina(it.id)).status, 200);
    const ds = await dataset(c.id);
    const r = trovaVoce(ds, "CLIENTI");
    assert.ok(r);
    assert.equal(ds.valori.find((x) => x.voce_id === r.id).importo, 777);
    assert.equal((await ripristina(it.id)).status, 404); // già ripristinato
  });

  await t("cestino: eliminazione multipla di righe e ripristino", async () => {
    const c = await nuovoCliente("Cestino Multiplo Srl");
    const ds = await dataset(c.id);
    const ids = ["CLIENTI", "CASSA", "BANCHE"].map((d) => trovaVoce(ds, d).id);
    await api("POST", `/clienti/${c.id}/voci/elimina`, { ids });
    const it = await ultimo();
    assert.ok(it.etichetta.startsWith("3 righe"));
    assert.equal((await ripristina(it.id)).body.ripristinati.length, 1);
    assert.equal((await dataset(c.id)).voci.length, ds.voci.length);
  });

  await t("cestino: azzera valori, vendite e parametri → ripristinabili", async () => {
    const c = await nuovoCliente("Cestino Azzera Srl");
    const v = trovaVoce(await dataset(c.id), "CLIENTI");
    await api("PUT", `/clienti/${c.id}/valore`, { voce_id: v.id, anno: 2025, importo: 50 });
    await api("POST", `/clienti/${c.id}/voci/azzera`, { ids: [v.id], cosa: "valori" });
    let it = await ultimo();
    assert.equal(it.tipo, "azzera_valori");
    await ripristina(it.id);
    assert.equal((await dataset(c.id)).valori.find((x) => x.voce_id === v.id).importo, 50);

    await api("PUT", `/clienti/${c.id}/vendite`, { anno: 2025, mese: 4, importo: 9 });
    await api("POST", `/clienti/${c.id}/vendite/azzera`, { mesi: [4] });
    it = await ultimo();
    assert.equal(it.tipo, "azzera_vendite");
    await ripristina(it.id);
    assert.ok((await dataset(c.id)).vendite.some((x) => x.mese === 4 && x.importo === 9));

    await api("PUT", `/clienti/${c.id}/parametri`, { anno: 2025, campo: "saldo_iniziale_cf", valore: 1234 });
    assert.equal((await api("POST", `/clienti/${c.id}/parametri/azzera`, { anno: 2025, campi: ["saldo_iniziale_cf"] })).status, 200);
    it = await ultimo();
    assert.equal(it.tipo, "azzera_parametri");
    await ripristina(it.id);
    assert.equal((await dataset(c.id)).parametri.find((p) => p.anno === 2025).saldo_iniziale_cf, 1234);
  });

  await t("cestino: esercizio eliminato → ripristinato", async () => {
    const c = await nuovoCliente("Cestino Anno Srl");
    await api("POST", `/clienti/${c.id}/anni`, {});
    const ds = await dataset(c.id);
    const anni = ds.parametri.map((p) => p.anno).sort();
    const daTogliere = anni[anni.length - 1];
    const v = trovaVoce(ds, "CLIENTI");
    await api("PUT", `/clienti/${c.id}/valore`, { voce_id: v.id, anno: daTogliere, importo: 5 });
    assert.equal((await api("DELETE", `/clienti/${c.id}/anni/${daTogliere}?conferma=1`)).status, 200);
    const it = await ultimo();
    assert.equal(it.tipo, "anno");
    await ripristina(it.id);
    const dopo = await dataset(c.id);
    assert.ok(dopo.parametri.some((p) => p.anno === daTogliere));
    assert.equal(dopo.valori.find((x) => x.voce_id === v.id && x.anno === daTogliere).importo, 5);
  });

  await t("cestino: cliente eliminato (singolo e multiplo) → ripristinato con tutti i dati", async () => {
    const c = await nuovoCliente("Cestino Cliente Srl");
    const d = await nuovoCliente("Cestino Cliente Due Srl");
    const v = trovaVoce(await dataset(c.id), "CLIENTI");
    await api("PUT", `/clienti/${c.id}/valore`, { voce_id: v.id, anno: 2025, importo: 321 });
    await api("PUT", `/clienti/${c.id}/vendite`, { anno: 2025, mese: 1, importo: 11 });
    await api("DELETE", `/clienti/${c.id}?conferma=${encodeURIComponent(c.ragione_sociale)}`);
    await api("POST", "/clienti/elimina-multiplo", { ids: [d.id] });
    const el = (await cestino()).elementi.filter((x) => x.tipo === "cliente");
    assert.ok(el.find((x) => x.etichetta === c.ragione_sociale));
    // conflitto: un altro cliente con la stessa ragione sociale impedisce il ripristino
    const clone = await nuovoCliente("Cestino Cliente Srl");
    const it = el.find((x) => x.cliente_id === c.id);
    assert.equal((await ripristina(it.id)).status, 409);
    await api("DELETE", `/clienti/${clone.id}`);
    const ids = el.filter((x) => [c.id, d.id].includes(x.cliente_id)).map((x) => x.id);
    const r = (await ripristina(...ids)).body;
    assert.equal(r.ripristinati.length, 2);
    const ds = await dataset(c.id);
    assert.equal(ds.valori.find((x) => x.voce_id === trovaVoce(ds, "CLIENTI").id).importo, 321);
    assert.ok(ds.vendite.some((x) => x.mese === 1 && x.importo === 11));
    assert.equal((await api("GET", `/clienti/${d.id}`)).status, 200);
  });

  await t("cestino: righe di un cliente eliminato non si ripristinano prima del cliente", async () => {
    const c = await nuovoCliente("Cestino Ordine Srl");
    const v = trovaVoce(await dataset(c.id), "CASSA");
    await api("DELETE", `/voci/${v.id}`);
    const rigaId = (await ultimo()).id;
    await api("DELETE", `/clienti/${c.id}`);
    const cliId = (await ultimo()).id;
    const r = await ripristina(rigaId);
    assert.equal(r.status, 409);
    assert.ok(/cliente/i.test(r.body.error));
    // ripristino in blocco: prima il cliente, poi le righe (senza duplicare quelle già presenti nella copia del cliente)
    const tutti = (await ripristina(cliId, rigaId)).body;
    assert.equal(tutti.errori.length, 0);
    assert.ok(trovaVoce(await dataset(c.id), "CASSA"));
  });

  await t("cestino: eliminazione definitiva, scadenza a 15 giorni e svuotamento", async () => {
    const c = await nuovoCliente("Cestino Scadenza Srl");
    await api("DELETE", `/clienti/${c.id}`);
    const it = await ultimo();
    assert.equal((await api("POST", "/cestino/elimina", { ids: [it.id, 999999] })).status, 404);
    // un elemento scaduto sparisce da solo
    db.run("UPDATE cestino SET scade_il=? WHERE id=?", ["2000-01-01T00:00:00.000Z", it.id]);
    assert.ok(!(await cestino()).elementi.some((x) => x.id === it.id));
    const c2 = await nuovoCliente("Cestino Definitivo Srl");
    await api("DELETE", `/clienti/${c2.id}`);
    const it2 = await ultimo();
    assert.equal((await api("POST", "/cestino/elimina", { ids: [it2.id] })).body.eliminati, 1);
    assert.equal((await api("POST", "/cestino/ripristina", { ids: [] })).status, 400);
    await api("DELETE", "/cestino");
    assert.equal((await api("GET", "/cestino/conteggio")).body.n, 0);
  });
};
