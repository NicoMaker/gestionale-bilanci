/* Crea per un nuovo cliente la struttura di partenza (sezioni, voci predefinite, anno base). */
const db = require("../../../core/db");
const { inserisciVociPredefinite } = require("./voci-predefinite");

function seedCliente(clienteId, annoBase) {
  inserisciVociPredefinite(clienteId);
  db.run(
    "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
    [clienteId, annoBase],
  );
}

module.exports = { seedCliente };
