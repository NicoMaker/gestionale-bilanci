/* Totali dello studio: GET /statistiche coerente con il riepilogo del singolo cliente. */
const assert = require("assert");
const { t, near } = require("../../helpers/runner");
const { api } = require("../../helpers/api");
const Calc = require("../../../../shared/calc");

module.exports = async function ({ demo, raw }) {
  await t(
    "statistiche: totali di studio coerenti con il riepilogo cliente",
    async () => {
      const r = await api("GET", "/statistiche");
      assert.equal(r.status, 200);
      const { totali, clienti, rating } = r.body;

      const riga = clienti.find((c) => c.id === demo.id);
      assert.ok(riga, "il cliente demo è nell'elenco");

      const rows = Calc.riepilogo(Calc.buildDs(await raw()));
      const ultima = rows[rows.length - 1];
      assert.equal(riga.esercizi, rows.length);
      assert.equal(riga.anno, ultima.anno);
      near(riga.ricavi, ultima.ricavi, 0.01);
      near(riga.utile, ultima.utile, 0.01);

      // i totali sono la somma delle righe con dati
      const conDati = clienti.filter((c) => !c.vuoto);
      assert.equal(totali.clienti, clienti.length);
      assert.equal(totali.clienti_con_dati, conDati.length);
      assert.equal(
        totali.esercizi,
        clienti.reduce((s, c) => s + c.esercizi, 0),
      );
      near(
        totali.ricavi,
        conDati.reduce((s, c) => s + c.ricavi, 0),
        0.01,
      );
      near(
        totali.utile,
        conDati.reduce((s, c) => s + c.utile, 0),
        0.01,
      );
      assert.equal(
        Object.values(rating).reduce((s, n) => s + n, 0),
        conDati.length,
      );
    },
  );

  await t("statistiche per anno: solo i dati dell'esercizio scelto", async () => {
    const tutti = (await api("GET", "/statistiche")).body;
    assert.ok(tutti.anni_disponibili.length > 0);
    const anno = tutti.anni_disponibili[tutti.anni_disponibili.length - 1]; // il più vecchio
    const r = await api("GET", `/statistiche?anno=${anno}`);
    assert.equal(r.status, 200);
    assert.equal(r.body.anno, anno);
    for (const c of r.body.clienti)
      assert.ok(c.anno === null || c.anno === anno);
    const rows = Calc.riepilogo(Calc.buildDs(await raw()));
    const rigaDemo = r.body.clienti.find((c) => c.id === demo.id);
    near(rigaDemo.ricavi, rows.find((x) => x.anno === anno).ricavi, 0.01);
    // anno senza dati per nessun cliente
    const vuoto = await api("GET", "/statistiche?anno=2099");
    assert.equal(vuoto.body.totali.clienti_con_dati, 0);
    assert.equal((await api("GET", "/statistiche?anno=abc")).status, 400);
  });
};
