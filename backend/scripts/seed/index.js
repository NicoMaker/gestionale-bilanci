/* Seed del database. Due insiemi di clienti:
   · completi → 20 aziende realistiche (settori diversi) con bilancio dettagliato, vendite, parametri, budget e cash flow
   · casi     → 27 casi limite (rating AAA…CCC, bilancio sbilanciato, anni vuoti, numeri estremi…)
   Uso:  npm run seed                 → i 20 clienti completi (aggiunge solo i mancanti)
         npm run seed:casi            → i 27 casi limite
         npm run seed:tutti           → entrambi gli insiemi (47 clienti)
         npm run seed:reset           → cancella i clienti di seed (note «SEED #») e ricrea i 20 completi
   Opzioni: --set=completi|casi|tutti   --reset */
const db = require("../../src/core/db");
const Calc = require("../../../shared/calc");
const { creaContesto } = require("./core/contesto");
const { loadRaw } = require("./core/dataset");
const insiemi = {
  completi: () => require("./completi"),
  casi: () => require("./casi"),
  tutti: () => require("./completi").concat(require("./casi")),
};
const arg = process.argv.find((a) => a.startsWith("--set="));
const nomeInsieme = arg ? arg.slice(6) : "completi";
if (!insiemi[nomeInsieme]) {
  console.error("Insieme sconosciuto:", nomeInsieme, "(usa completi, casi o tutti)");
  process.exit(1);
}
const casi = insiemi[nomeInsieme]();

function eliminaSeed() {
  const ids = db
    .all("SELECT id FROM clienti WHERE note LIKE 'SEED #%'")
    .map((r) => r.id);
  db.tx(() => {
    for (const id of ids) {
      for (const t of ["valori", "budget_var", "cashflow"])
        db.run(
          `DELETE FROM ${t} WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)`,
          [id],
        );
      db.run("DELETE FROM voci WHERE cliente_id=?", [id]);
      db.run("DELETE FROM vendite WHERE cliente_id=?", [id]);
      db.run("DELETE FROM parametri_anno WHERE cliente_id=?", [id]);
      db.run("DELETE FROM clienti WHERE id=?", [id]);
    }
  });
  return ids.length;
}

function riepilogo(cid, anni) {
  const ds = Calc.buildDs(loadRaw(cid));
  const a = anni[anni.length - 1];
  const y = Calc.yearData(ds, a);
  const rat = y.rating.rating || "n.d.";
  return {
    rating: rat,
    utile: Math.round(y.ce.utile),
    check: Math.round(y.sp.check * 100) / 100 || 0,
  };
}

(async () => {
  await db.init();
  if (process.argv.includes("--reset"))
    console.log(`🗑️  Rimossi ${eliminaSeed()} clienti di seed`);
  const righe = [];
  for (const caso of casi) {
    if (
      db.one("SELECT id FROM clienti WHERE ragione_sociale = ?", [
        caso.ragione_sociale,
      ])
    ) {
      console.log("↷ già presente:", caso.ragione_sociale.slice(0, 50));
      continue;
    }
    const cid = db.tx(() => {
      const ctx = creaContesto(caso);
      caso.popola(ctx);
      return ctx.cid;
    });
    const r = riepilogo(cid, caso.anni);
    righe.push({
      id: cid,
      cliente: caso.ragione_sociale.slice(0, 38),
      anni: caso.anni.join(","),
      ...r,
      atteso: caso.atteso ? String(caso.atteso.rating ?? "n.d.") : "",
    });
  }
  db.flush();
  if (righe.length) console.table(righe);
  const errati = righe.filter((r) => r.atteso && r.atteso !== r.rating);
  console.log(
    `✅ ${righe.length} clienti creati (${casi.length} disponibili nell'insieme «${nomeInsieme}»)`,
  );
  if (errati.length) {
    console.error(
      "❌ Rating diverso dall'atteso:",
      errati.map((r) => r.cliente + " " + r.rating + "≠" + r.atteso).join("; "),
    );
    process.exit(1);
  }
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
