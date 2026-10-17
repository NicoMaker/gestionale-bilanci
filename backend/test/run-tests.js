/* Test automatici: motore di calcolo + API (database temporaneo). Uso: npm test */
const assert = require("assert");
const os = require("os");
const path = require("path");
process.env.PORT = "3999";
process.env.DB_PATH = path.join(os.tmpdir(), "gb-test-" + Date.now() + ".db");
const { start } = require("../server");
const Calc = require("../shared/calc.js");

const base = "http://localhost:3999/api";
const api = async (m, u, b) => {
  const r = await fetch(base + u, {
    method: m,
    headers: { "Content-Type": "application/json" },
    body: b ? JSON.stringify(b) : undefined,
  });
  const j = await r.json().catch(() => null);
  return { status: r.status, body: j };
};
let ok = 0;
const t = async (name, fn) => {
  try {
    await fn();
    ok++;
    console.log("  ✓", name);
  } catch (e) {
    console.error("  ✗", name, "\n    ", e.message);
    process.exitCode = 1;
  }
};
const near = (a, b, eps = 0.005) =>
  assert.ok(Math.abs(a - b) <= eps, `${a} ≠ ${b}`);

(async () => {
  const { server } = await start();
  console.log("\nTest Gestionale Bilanci");

  await t("crea cliente + struttura di partenza", async () => {
    const r = await api("POST", "/clienti", {
      ragione_sociale: "Test Srl",
      anno_base: 2024,
    });
    assert.equal(r.status, 201);
    const ds = await api("GET", `/clienti/${r.body.id}/dataset`);
    assert.ok(ds.body.voci.length >= 80);
    assert.deepEqual(
      ds.body.parametri.map((p) => p.anno),
      [2024],
    );
  });
  await t("validazioni", async () => {
    assert.equal(
      (await api("POST", "/clienti", { ragione_sociale: "", anno_base: 2024 }))
        .status,
      400,
    );
    assert.equal(
      (await api("POST", "/clienti", { ragione_sociale: "X", anno_base: 1800 }))
        .status,
      400,
    );
    assert.equal((await api("GET", "/clienti/9999")).status, 404);
  });

  const demo = (await api("POST", "/demo")).body;
  const raw = () =>
    api("GET", `/clienti/${demo.id}/dataset`).then((r) => r.body);

  await t(
    "demo: stato patrimoniale in pareggio (check = 0) e rating",
    async () => {
      const ds = Calc.buildDs(await raw());
      for (const a of [2022, 2023, 2024, 2025]) {
        const d = Calc.yearData(ds, a);
        near(d.sp.check, 0);
        assert.equal(d.rating.rating, "AAA");
      }
      near(Calc.ceYear(ds, 2024).utile, 221000);
      assert.ok(Calc.ceYear(ds, 2025).utile > 250000);
      assert.deepEqual(Calc.anni(ds), [2022, 2023, 2024, 2025]);
      const R = Calc.compute(ds, 2025); // budget 2026 + cash flow 2026 calcolati dall'anno 2025
      assert.ok(
        R.bud.H.ricavi > 2500000 &&
          R.cf.liq[11] > 0 &&
          R.bep.rows.length === 13,
      );
      // tutti gli esercizi in colonna: quelli con dati + la finestra di 3 anni, ciascuno già calcolato
      assert.deepEqual(R.tutti, [2022, 2023, 2024, 2025]);
      assert.deepEqual(R.years, [2023, 2024, 2025]);
      assert.ok(
        R.tutti.every((a) => R.anni[a] && R.anni[a].sp && R.anni[a].ce),
      );
      const R22 = Calc.compute(ds, 2022); // anno di riferimento più vecchio: gli anni successivi restano visibili
      assert.deepEqual(R22.tutti, [2020, 2021, 2022, 2023, 2024, 2025]);
    },
  );
  await t(
    "budget: fattori per tipo e variazioni manuali (regola Excel)",
    async () => {
      const ds = Calc.buildDs(await raw());
      const b = Calc.budget(ds, 2024);
      const vend = ds.voci.find((v) => v.descrizione === "Vendite prodotti");
      near(b.righe[vend.id].F, 1.02 * 1.01, 1e-9); // IP
      near(b.righe[vend.id].H, 2100000 * 1.02 * 1.01, 0.01);
      const serv = ds.voci.find(
        (v) => v.descrizione === "Prestazioni di servizi",
      );
      near(b.righe[serv.id].H, 230000 * 1.1, 0.01); // decimale → moltiplicatore
      const pub = ds.voci.find((v) => v.descrizione === "Pubblicità");
      near(b.righe[pub.id].H, 25000 + 5000, 0.01); // intero → somma
      assert.equal(Calc.fattore("z", 2, 1), 0);
      assert.equal(Calc.fattore("O", 2, 1), 1);
    },
  );
  await t("scrittura valore, persistenza e ricalcolo", async () => {
    const r0 = await raw();
    const v = r0.voci.find((x) => x.descrizione === "CLIENTI");
    assert.equal(
      (
        await api("PUT", `/clienti/${demo.id}/valore`, {
          voce_id: v.id,
          anno: 2024,
          importo: 777,
        })
      ).status,
      200,
    );
    const ds = Calc.buildDs(await raw());
    near(Calc.spYear(ds, 2024).crediti_entro, 777);
    assert.ok(Math.abs(Calc.spYear(ds, 2024).check) > 1); // ora non quadra
    await api("PUT", `/clienti/${demo.id}/valore`, {
      voce_id: v.id,
      anno: 2024,
      importo: null,
    });
    const ds2 = Calc.buildDs(await raw());
    near(Calc.spYear(ds2, 2024).crediti_entro, 0);
  });
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
  await t("parametri, vendite, cash flow, anni", async () => {
    assert.equal(
      (
        await api("PUT", `/clienti/${demo.id}/parametri`, {
          anno: 2024,
          campo: "inflazione",
          valore: 3,
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await api("PUT", `/clienti/${demo.id}/parametri`, {
          anno: 2024,
          campo: "drop table",
          valore: 3,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await api("PUT", `/clienti/${demo.id}/vendite`, {
          anno: 2024,
          mese: 13,
          importo: 1,
        })
      ).status,
      400,
    );
    const ds = Calc.buildDs(await raw());
    near(ds.par[2024].inflazione, 3);
    const cf = Calc.cashflow(ds, 2024);
    near(cf.liq[11], cf.saldo[11] + cf.entrate[11] + cf.uscite[11]);
    near(cf.saldo[1], cf.liq[0]);
    assert.equal(
      (await api("POST", `/clienti/${demo.id}/anni`, {})).body.anno,
      2026,
    );
    assert.equal(
      (await api("DELETE", `/clienti/${demo.id}/anni/2026`)).status,
      200,
    ); // anno vuoto: eliminazione diretta
  });
  await t("rating: soglie dello scoring", async () => {
    const sp = {
      rimanenze: 0,
      crediti_entro: 100,
      liquidita: 0,
      risconti: 0,
      attivo_fisso: 0,
      totale_attivo: 1000,
      banche: 0,
      corr_varie: 80,
      cons_varie: 0,
      finanz: 0,
      pn: 60,
      totale_passivita: 1000,
    };
    const ce = { ricavi: 1000, ammortamenti: 0, oneri_fin: 40, utile: 50 };
    const r = Calc.ratingYear(sp, ce);
    assert.equal(r.s1, 3);
    assert.equal(r.s2, 3);
    assert.equal(r.s3, 3);
    assert.equal(r.s4, 3);
    assert.equal(r.rating, "AAA");
  });
  await t("download database SQLite", async () => {
    const r = await fetch(base + "/download-db");
    const buf = Buffer.from(await r.arrayBuffer());
    assert.equal(buf.slice(0, 15).toString(), "SQLite format 3");
  });
  await t(
    "validazioni cliente: P.IVA, duplicati, demo già presente, numeri",
    async () => {
      assert.equal(
        (
          await api("POST", "/clienti", {
            ragione_sociale: "Altro",
            partita_iva: "123",
            anno_base: 2024,
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await api("POST", "/clienti", {
            ragione_sociale: "  test SRL ",
            anno_base: 2024,
          })
        ).status,
        409,
      ); // duplicato (case/spazi)
      assert.equal(
        (
          await api("POST", "/clienti", {
            ragione_sociale: "Altro",
            partita_iva: "01234567890",
            anno_base: 2024,
          })
        ).status,
        409,
      ); // P.IVA già usata
      assert.equal((await api("POST", "/demo")).status, 409);
      const v = (await raw()).voci.find((x) => x.descrizione === "CLIENTI");
      assert.equal(
        (
          await api("PUT", `/clienti/${demo.id}/valore`, {
            voce_id: v.id,
            anno: 2024,
            importo: 1e15,
          })
        ).status,
        400,
      );
    },
  );
  await t(
    "eliminazione anno: senza dati diretta, con dati serve conferma",
    async () => {
      const d = await api("GET", `/clienti/${demo.id}/anni/2022/dati`);
      assert.equal(d.body.ha_dati, true);
      const r = await api("DELETE", `/clienti/${demo.id}/anni/2022`);
      assert.equal(r.status, 409);
      assert.equal(r.body.richiede_conferma, true);
      assert.equal(
        (await api("GET", `/clienti/${demo.id}/anni/2022/dati`)).body.ha_dati,
        true,
      ); // non cancellato
      assert.equal(
        (await api("DELETE", `/clienti/${demo.id}/anni/2022?conferma=1`))
          .status,
        200,
      );
      const ds = Calc.buildDs(await raw());
      assert.deepEqual(Calc.anni(ds), [2023, 2024, 2025]);
      assert.equal(
        (await api("DELETE", `/clienti/${demo.id}/anni/1999`)).status,
        404,
      );
    },
  );
  await t("eliminazione cliente senza dati: diretta", async () => {
    const c = (
      await api("POST", "/clienti", {
        ragione_sociale: "Vuoto Srl",
        anno_base: 2025,
      })
    ).body;
    const d = await api("GET", `/clienti/${c.id}/dati`);
    assert.equal(d.body.ha_dati, false);
    assert.equal((await api("DELETE", `/clienti/${c.id}`)).status, 200);
    assert.equal((await api("GET", `/clienti/${c.id}`)).status, 404);
  });
  await t(
    "eliminazione cliente con dati: richiede la ragione sociale",
    async () => {
      const c = (
        await api("POST", "/clienti", {
          ragione_sociale: "Con Dati Srl",
          anno_base: 2025,
        })
      ).body;
      const v = (await api("GET", `/clienti/${c.id}/dataset`)).body.voci.find(
        (x) => x.descrizione === "CLIENTI",
      );
      await api("PUT", `/clienti/${c.id}/valore`, {
        voce_id: v.id,
        anno: 2025,
        importo: 100,
      });
      const d = await api("GET", `/clienti/${c.id}/dati`);
      assert.equal(d.body.ha_dati, true);
      assert.equal(d.body.totale, 1);
      let r = await api("DELETE", `/clienti/${c.id}`);
      assert.equal(r.status, 409);
      assert.equal(r.body.richiede_conferma, true);
      assert.equal(
        (await api("DELETE", `/clienti/${c.id}?conferma=sbagliato`)).status,
        409,
      );
      assert.equal((await api("GET", `/clienti/${c.id}`)).status, 200); // ancora presente
      assert.equal(
        (
          await api(
            "DELETE",
            `/clienti/${c.id}?conferma=${encodeURIComponent("con dati srl")}`,
          )
        ).status,
        200,
      );
      assert.equal((await api("GET", `/clienti/${c.id}`)).status, 404);
    },
  );
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

  console.log(
    `\n${ok} test superati${process.exitCode ? " — CI SONO FALLIMENTI" : ""}\n`,
  );
  server.close();
  process.exit(process.exitCode || 0);
})();
