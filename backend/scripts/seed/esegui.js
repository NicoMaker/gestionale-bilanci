/* Logica del seed, riusabile da riga di comando (npm run seed / dev) e dal pulsante «Carica clienti demo».
   Il database deve essere già inizializzato (db.init()). Aggiunge solo i clienti mancanti. */
const db = require("../../src/core/db");
const Calc = require("../../../shared/calc");
const { creaContesto } = require("./core/cliente/contesto");
const { loadRaw } = require("./core/cliente/dataset");

const insiemi = {
  completi: () => require("./completi"),
  casi: () => require("./casi"),
  tutti: () => require("./completi").concat(require("./casi")),
};

// cancella i clienti di seed (note «SEED #…») con tutti i loro dati
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
  const y = Calc.yearData(ds, anni[anni.length - 1]);
  return {
    rating: y.rating.rating || "n.d.",
    utile: Math.round(y.ce.utile),
    check: Math.round(y.sp.check * 100) / 100 || 0,
  };
}

/* nomeInsieme: completi | casi | tutti — ritorna { righe, saltati, disponibili, rimossi } */
function eseguiSeed({
  insieme = "completi",
  reset = false,
  log = () => {},
} = {}) {
  if (!insiemi[insieme])
    throw new Error(
      `Insieme sconosciuto: ${insieme} (usa completi, casi o tutti)`,
    );
  const casi = insiemi[insieme]();
  const rimossi = reset ? eliminaSeed() : 0;
  const righe = [];
  let saltati = 0;
  for (const caso of casi) {
    if (
      db.one("SELECT id FROM clienti WHERE ragione_sociale = ?", [
        caso.ragione_sociale,
      ])
    ) {
      saltati++;
      log("↷ già presente:", caso.ragione_sociale.slice(0, 50));
      continue;
    }
    const cid = db.tx(() => {
      const ctx = creaContesto(caso);
      caso.popola(ctx);
      return ctx.cid;
    });
    righe.push({
      id: cid,
      cliente: caso.ragione_sociale.slice(0, 38),
      anni: caso.anni.join(","),
      ...riepilogo(cid, caso.anni),
      atteso: caso.atteso ? String(caso.atteso.rating ?? "n.d.") : "",
    });
  }
  db.flush();
  return { righe, saltati, disponibili: casi.length, rimossi };
}

module.exports = { eseguiSeed };
