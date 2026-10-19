/* Vendite mensili: totale annuo ripartito con una curva di stagionalità, oppure mesi espliciti {anno: [12 importi, null = vuoto]}. */
const db = require("../../../src/core/db");
const { TIPICA } = require("./stagionalita");

function inserisciVendite(ctx, { tot, stag = TIPICA, mesi } = {}) {
  const { cid, anni } = ctx;
  const put = (a, m, x) =>
    x != null &&
    db.run(
      "INSERT OR REPLACE INTO vendite (cliente_id, anno, mese, importo) VALUES (?,?,?,?)",
      [cid, a, m + 1, x],
    );
  if (tot)
    anni.forEach((a, i) => {
      if (tot[i] == null) return;
      const curva = Array.isArray(stag[0]) ? stag[i] : stag; // una curva per tutti o una per anno
      curva.forEach((pc, m) =>
        put(a, m, Math.round(((tot[i] * pc) / 100) * 100) / 100),
      );
    });
  if (mesi)
    for (const a of Object.keys(mesi))
      mesi[a].forEach((x, m) => put(Number(a), m, x));
}

module.exports = { inserisciVendite };
