/* Test automatici: motore di calcolo + API (database temporaneo). Uso: npm test */
require("./helpers/env");
const { start } = require("../server");
const { api } = require("./helpers/api");
const { report } = require("./helpers/runner");

const SUITES = [
  "clienti/cliente-base",
  "calcoli/calcoli-demo",
  "clienti/statistiche",
  "calcoli/budget",
  "calcoli/valori",
  "dati/voci",
  "dati/parametri-anni",
  "calcoli/rating",
  "dati/database",
  "clienti/validazioni-cliente",
  "dati/elimina-anno",
  "clienti/elimina-cliente",
  "clienti/elimina-demo",
  "anni/esercizi-automatici",
  "anni/crea-multiplo",
  "clienti/elimina-multiplo",
];

(async () => {
  const { server } = await start();
  console.log("\nTest Gestionale Bilanci");

  // la suite cliente-base gira prima della creazione del cliente demo
  await require("./suites/" + SUITES[0])({});

  const demo = (await api("POST", "/demo")).body;
  const raw = () =>
    api("GET", `/clienti/${demo.id}/dataset`).then((r) => r.body);

  for (const nome of SUITES.slice(1))
    await require("./suites/" + nome)({ demo, raw });

  report();
  server.close();
  process.exit(process.exitCode || 0);
})();
