/* Vendite mensili del cliente demo (2022-2025). */
const db = require("../../../../core/db");
const { ANNI, STAG } = require("../costanti");

function inserisciVendite(cid) {
  const tot = [2000000, 2160000, 2330000, 2490000];
  ANNI.forEach((a, i) =>
    STAG.forEach((p, m) =>
      db.run(
        "INSERT OR REPLACE INTO vendite (cliente_id, anno, mese, importo) VALUES (?,?,?,?)",
        [cid, a, m + 1, Math.round((tot[i] * p) / 100)],
      ),
    ),
  );
}

module.exports = { inserisciVendite };
