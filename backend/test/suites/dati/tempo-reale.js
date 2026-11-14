/* Tempo reale (socket.io): una modifica fatta da un browser arriva agli altri, ma non a chi l'ha fatta; errori e letture non generano avvisi. */
const assert = require("assert");
const { io } = require("socket.io-client");
const { t } = require("../../helpers/runner");
const { base } = require("../../helpers/api");

const URL = base.replace(/\/api$/, "");
const attendi = (ms) => new Promise((r) => setTimeout(r, ms));

const connetti = () =>
  new Promise((resolve, reject) => {
    const s = io(URL, { transports: ["websocket"], forceNew: true });
    s.once("connect", () => resolve(s));
    s.once("connect_error", reject);
  });

/* chiamata API facendosi riconoscere come il socket `da` (header X-Socket-Id, come fa il browser) */
const chiama = async (da, metodo, percorso, body) => {
  const r = await fetch(base + percorso, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(da ? { "X-Socket-Id": da.id } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, body: await r.json().catch(() => null) };
};

module.exports = async function () {
  const A = await connetti();
  const B = await connetti();
  const ricevutiA = [];
  const ricevutiB = [];
  A.on("dati:cambiati", (p) => ricevutiA.push(p));
  B.on("dati:cambiati", (p) => ricevutiB.push(p));

  await t("tempo reale: la modifica di A arriva a B, non ad A", async () => {
    const r = await chiama(A, "POST", "/clienti", {
      ragione_sociale: "Tempo Reale Srl",
      anno_base: 2024,
    });
    assert.equal(r.status, 201);
    await attendi(300);
    assert.equal(ricevutiB.length, 1, "B riceve l'avviso");
    assert.equal(ricevutiB[0].metodo, "POST");
    assert.equal(ricevutiB[0].cliente_id, null);
    assert.equal(ricevutiA.length, 0, "A (chi ha modificato) non lo riceve");

    // modifica di una cella: l'avviso indica il cliente toccato
    const ds = await chiama(null, "GET", `/clienti/${r.body.id}/dataset`);
    const voce = ds.body.voci.find((v) => v.ambito === "CE");
    const put = await chiama(A, "PUT", `/clienti/${r.body.id}/valore`, {
      voce_id: voce.id,
      anno: 2024,
      importo: 100,
    });
    assert.equal(put.status, 200);
    await attendi(300);
    assert.equal(ricevutiB.length, 2);
    assert.equal(ricevutiB[1].cliente_id, r.body.id);
    assert.equal(ricevutiA.length, 0);
  });

  await t(
    "tempo reale: senza header ricevono tutti, anche chi scrive",
    async () => {
      ricevutiA.length = ricevutiB.length = 0;
      await chiama(null, "POST", "/clienti", {
        ragione_sociale: "Altro Srl",
        anno_base: 2024,
      });
      await attendi(300);
      assert.equal(ricevutiA.length, 1);
      assert.equal(ricevutiB.length, 1);
    },
  );

  await t("tempo reale: letture ed errori non generano avvisi", async () => {
    ricevutiA.length = ricevutiB.length = 0;
    assert.equal((await chiama(A, "GET", "/clienti")).status, 200);
    assert.equal((await chiama(A, "GET", "/statistiche")).status, 200);
    assert.equal(
      (
        await chiama(A, "POST", "/clienti", {
          ragione_sociale: "",
          anno_base: 2024,
        })
      ).status,
      400,
    );
    await attendi(300);
    assert.equal(ricevutiA.length + ricevutiB.length, 0);
  });

  A.close();
  B.close();
};
