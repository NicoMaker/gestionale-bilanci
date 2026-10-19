/* Stato Patrimoniale del cliente demo (scala sui tre anni). */
function inserisciStatoPatrimoniale({ riga, esistente }) {
  const k = [0.88, 0.94, 1]; // fattori rispetto al 2024
  const sc = (v) => k.map((f) => Math.round((v * f) / 1000) * 1000);
  riga("A_IMM_IMM", "Software e licenze", sc(40000));
  esistente("A_IMM_IMM", "F.DO AMM.", sc(-25000));
  riga("A_IMM_MAT", "Fabbricati", [600000, 600000, 600000]);
  riga("A_IMM_MAT", "Impianti e macchinari", sc(350000));
  riga("A_IMM_MAT", "Attrezzature", sc(80000));
  esistente("A_IMM_MAT", "F.DO AMM.", [-215000, -247000, -280000]);
  esistente("A_IMM_FIN", "TITOLI/AZIONI", [20000, 20000, 20000]);
  esistente("A_IMM_FIN", "CAUZIONI", [8000, 8000, 8000]);
  esistente("A_RIMANENZE", "MERCI", [100000, 110000, 120000]);
  esistente("A_CRED_ENTRO", "CLIENTI", sc(520000));
  riga(
    "A_CRED_OLTRE",
    "Crediti tributari a lungo termine",
    [15000, 15000, 15000],
  );
  esistente("A_LIQUIDITA", "CASSA", [4000, 5000, 5000]);
  esistente("A_LIQUIDITA", "BANCHE", sc(160000));
  esistente("A_RISCONTI", "RISCONTI ATTIVI", [5000, 5000, 6000]);
  esistente("P_PN", "CAPITALE SOCIALE", [100000, 100000, 100000]);
  esistente("P_PN", "RISERVA LEGALE", [15000, 18000, 20000]);
  esistente("P_CONS_VARIE", "FINANZIAM SOCI", [30000, 30000, 30000]);
  esistente("P_CONS_VARIE", "FONDO SVALUT CREDITI", [12000, 14000, 15000]);
  esistente(
    "P_CONS_VARIE",
    "FONDO ACCANTONAMENTO IMPOSTE",
    [8000, 9000, 10000],
  );
  esistente("P_CONS_VARIE", "FDO TFR", [110000, 135000, 160000]);
  esistente("P_FINANZ", "MUTUI", [460000, 420000, 380000]);
  esistente("P_FINANZ", "ALTRI PRESTITI", [60000, 50000, 40000]);
  esistente("P_BANCHE", "BANCA C/C", sc(90000));
  esistente("P_CORR_VARIE", "FORNITORI", sc(330000));
  riga("P_CORR_VARIE", "Debiti tributari", sc(45000));
  riga("P_CORR_VARIE", "Debiti verso dipendenti e istituti", sc(38000));
}

module.exports = { inserisciStatoPatrimoniale };
