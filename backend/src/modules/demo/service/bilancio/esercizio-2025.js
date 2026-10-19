/* Esercizio 2025: derivato dal 2024 con crescite per sezione e alcuni valori puntuali. */
const db = require("../../../../core/db");

function inserisciEsercizio2025(cid) {
  const FATT = {
    C_RICAVI: 1.07,
    C_ACQUISTI: 1.06,
    C_PRODUTTIVI: 1.05,
    C_PERSONALE: 1.04,
    C_COMMERCIALI: 1.06,
    C_AMMINISTRATIVI: 1.03,
    C_AMMORTAMENTI: 1.04,
    C_ONERI_TRIB: 1.02,
    C_ONERI_FIN: 0.92,
    C_PROVENTI_FIN: 1,
    C_RICAVI_EXTRA: 0.4,
    C_COSTI_EXTRA: 1.5,
    C_IMPOSTE: 1.12,
  };
  const ASSOLUTI = {
    "C_RIM_INIZ|RIMANENZE INIZIALI": 120000,
    "C_RIM_FIN|RIMANENZE FINALI": 130000,
    "A_IMM_IMM|F.DO AMM.": -30000,
    "A_IMM_MAT|F.DO AMM.": -335000,
    "A_IMM_MAT|Fabbricati": 600000,
    "A_IMM_FIN|TITOLI/AZIONI": 20000,
    "A_IMM_FIN|CAUZIONI": 8000,
    "A_RIMANENZE|MERCI": 130000,
    "A_CRED_OLTRE|Crediti tributari a lungo termine": 15000,
    "A_LIQUIDITA|CASSA": 6000,
    "A_RISCONTI|RISCONTI ATTIVI": 6000,
    "P_PN|CAPITALE SOCIALE": 100000,
    "P_PN|RISERVA LEGALE": 22000,
    "P_CONS_VARIE|FINANZIAM SOCI": 25000,
    "P_CONS_VARIE|FONDO SVALUT CREDITI": 16000,
    "P_CONS_VARIE|FONDO ACCANTONAMENTO IMPOSTE": 11000,
    "P_CONS_VARIE|FDO TFR": 187000,
    "P_FINANZ|MUTUI": 340000,
    "P_FINANZ|ALTRI PRESTITI": 30000,
  };
  db.all(
    "SELECT x.id, x.sezione, x.descrizione, v.importo FROM voci x JOIN valori v ON v.voce_id=x.id AND v.anno=2024 WHERE x.cliente_id=?",
    [cid],
  ).forEach((r) => {
    if (
      /^RISULTATO/.test(r.descrizione) ||
      r.descrizione === "RISERVA STRAORDINARIA"
    )
      return;
    const chiave = r.sezione + "|" + r.descrizione;
    const ce = r.sezione.startsWith("C_");
    let val =
      chiave in ASSOLUTI
        ? ASSOLUTI[chiave]
        : r.importo * (FATT[r.sezione] || 1.04);
    const q = ce ? 100 : 1000;
    val = Math.round(val / q) * q;
    db.run(
      "INSERT OR REPLACE INTO valori (voce_id, anno, importo) VALUES (?,?,?)",
      [r.id, 2025, val],
    );
  });
  {
    // lo storico delle altre voci create dalla demo senza valori 2024 non esiste: nulla da fare
  }
}

module.exports = { inserisciEsercizio2025 };
