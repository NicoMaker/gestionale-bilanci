/* Righe aggiunte dall'utente: tutti i tipi riga (IP, I, P, O, Z, V, F), descrizione vuota, caratteri speciali, righe in ogni sezione, codici. */
const { profilo } = require("../../core/cliente/profilo");
const ricavi = [600000, 700000];
module.exports = {
  ragione_sociale: "Righe Personalizzate S.r.l.",
  partita_iva: "99000000023",
  note: "SEED #23 — una riga per ogni tipo, descrizioni limite, variazioni budget su righe nuove.",
  anno_base: 2025,
  anni: [2024, 2025],
  popola(ctx) {
    const { ce, sp } = profilo({ ricavi, margine: 0.05 });
    const extra = [
      {
        sez: "C_RICAVI",
        descr: "Ricavi accessori (tipo IP)",
        valori: [20000, 25000],
        tipo: "IP",
        codice: "R1",
      },
      {
        sez: "C_ACQUISTI",
        descr: "Acquisti merce (tipo I)",
        valori: [30000, 31000],
        tipo: "I",
        codice: "A1",
      },
      {
        sez: "C_ACQUISTI",
        descr: "Acquisti imballi (tipo P)",
        valori: [8000, 9000],
        tipo: "P",
      },
      {
        sez: "C_PRODUTTIVI",
        descr: "Lavorazioni esterne (tipo O)",
        valori: [12000, 13000],
        tipo: "O",
      },
      {
        sez: "C_COSTI_EXTRA",
        descr: "Sopravvenienze passive (tipo Z)",
        valori: [1500, 0],
        tipo: "Z",
      },
      {
        sez: "C_COMMERCIALI",
        descr: "Provvigioni agenti (tipo V)",
        valori: [18000, 21000],
        tipo: "V",
      },
      {
        sez: "C_AMMINISTRATIVI",
        descr: "Consulenze (tipo F)",
        valori: [15000, 15000],
        tipo: "F",
      },
      {
        sez: "C_AMMINISTRATIVI",
        descr: "Spese “rappresentanza” & omaggi – d'esercizio è/à/ò",
        valori: [2200, 2400],
        tipo: "F",
      },
      { sez: "C_AMMINISTRATIVI", descr: "", valori: [100, 100], tipo: "F" }, // descrizione vuota
      {
        sez: "A_CRED_OLTRE",
        descr: "Depositi cauzionali",
        valori: [5000, 5000],
      },
      { sez: "P_FINANZ", descr: "Finanziamento soci", valori: [40000, 30000] },
    ];
    ctx.bilancio({ ...ce, ...sp, extra });
    ctx.quadra();
    ctx.vendite({ tot: ricavi });
    ctx.budgetVar("C_COMMERCIALI", "Provvigioni agenti (tipo V)", 2025, 1.05);
    ctx.budgetVar("C_AMMINISTRATIVI", "Consulenze (tipo F)", 2025, -3000);
    ctx.cfRiga(2025, "CF_U_ALTRE", "Consulente ambientale (nuova)", -1200, {
      nuova: true,
    });
  },
};
