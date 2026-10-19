/* Seed del database da riga di comando. Due insiemi di clienti:
   · completi → 20 aziende realistiche (settori diversi) con bilancio dettagliato, vendite, parametri, budget e cash flow
   · casi     → 27 casi limite (rating AAA…CCC, bilancio sbilanciato, anni vuoti, numeri estremi…)
   Uso:  npm run seed / demo          → i 20 clienti completi (aggiunge solo i mancanti)
         npm run seed:casi            → i 27 casi limite
         npm run seed:tutti           → entrambi gli insiemi (47 clienti)
         npm run seed:reset           → cancella i clienti di seed (note «SEED #») e ricrea i 20 completi
         npm run demo                 → come «npm run seed»: i 20 clienti completi (lo stesso del pulsante «Carica clienti demo»)
         npm run dev                  → avvia solo il server con riavvio automatico (nessun dato di esempio)
   Opzioni: --set=completi|casi|tutti   --reset   --quiet */
const db = require("../../src/core/db");
const { eseguiSeed } = require("./esegui");

const arg = process.argv.find((a) => a.startsWith("--set="));
const insieme = arg ? arg.slice(6) : "completi";
const quiet = process.argv.includes("--quiet");
const log = quiet ? () => {} : console.log;

(async () => {
  await db.init();
  let r;
  try {
    r = eseguiSeed({
      insieme,
      reset: process.argv.includes("--reset"),
      log,
    });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  if (r.rimossi) log(`🗑️  Rimossi ${r.rimossi} clienti di seed`);
  if (r.righe.length && !quiet) console.table(r.righe);
  console.log(
    `✅ ${r.righe.length} clienti creati (${r.disponibili} disponibili nell'insieme «${insieme}»)`,
  );
  const errati = r.righe.filter((x) => x.atteso && x.atteso !== x.rating);
  if (errati.length) {
    console.error(
      "❌ Rating diverso dall'atteso:",
      errati.map((x) => x.cliente + " " + x.rating + "≠" + x.atteso).join("; "),
    );
    process.exit(1);
  }
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
