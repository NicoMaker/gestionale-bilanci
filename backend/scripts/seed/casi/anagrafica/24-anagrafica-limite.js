/* Anagrafica al limite: ragione sociale lunga con caratteri speciali, note lunghissime, anno base molto vecchio, un solo anno. */
const { profilo } = require("../../core/cliente/profilo");
module.exports = {
  ragione_sociale:
    "Società Agricola « Fratelli D'Angelo & Figli » S.n.c. di Zanè Åke — Vini, Olii e Prodotti Tipici dell'Alto Adige/Südtirol",
  partita_iva: "99000000024",
  note:
    "SEED #24 — " +
    "Nota molto lunga con accenti àèéìòù e simboli €&%. ".repeat(40),
  anno_base: 2000,
  anni: [2000],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi: [95000] });
    ctx.bilancio({ ...ce, ...sp });
    ctx.quadra();
    ctx.vendite({ tot: [95000] });
  },
};
