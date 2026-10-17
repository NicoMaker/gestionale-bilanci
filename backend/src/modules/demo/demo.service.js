/* Cliente demo: 3 anni di dati coerenti (stato patrimoniale in pareggio), vendite mensili, budget e cash flow. */
const db = require("../../core/db");
const Calc = require("../../../shared/calc.js");
const { seedCliente } = require("../clienti/clienti.seed");
const { loadRaw } = require("../dataset/dataset.service");

const ANNI = [2022, 2023, 2024, 2025];

function creaDemo() {
  return db.tx(() => {
    const cid = db.insert(
      "INSERT INTO clienti (ragione_sociale, partita_iva, note, anno_base) VALUES (?,?,?,?)",
      [
        "Azienda Demo S.r.l.",
        "01234567890",
        "Cliente di esempio con dati fittizi (esercizi 2022-2025).",
        2025,
      ],
    );
    seedCliente(cid, 2025);
    for (const a of [2022, 2023, 2024])
      db.run(
        "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
        [cid, a],
      );

    const trova = (sez, descr) =>
      db.one(
        "SELECT id FROM voci WHERE cliente_id=? AND sezione=? AND descrizione=?",
        [cid, sez, descr],
      ).id;
    const ambitoDi = (sez) =>
      sez.startsWith("A_") || sez.startsWith("P_")
        ? "SP"
        : sez.startsWith("CF_")
          ? "CF"
          : "CE";
    const tipoDef = {
      C_RICAVI: "IP",
      C_ACQUISTI: "IP",
      C_RICAVI_EXTRA: "Z",
      C_COSTI_EXTRA: "Z",
    };
    const aggiungi = (sez, descr, tipo) => {
      const amb = ambitoDi(sez);
      const ord = db.one(
        "SELECT COALESCE(MAX(ordine),0)+1 AS o FROM voci WHERE cliente_id=? AND sezione=?",
        [cid, sez],
      ).o;
      return db.insert(
        "INSERT INTO voci (cliente_id, ambito, sezione, codice, descrizione, tipo, ordine, fissa) VALUES (?,?,?,?,?,?,?,0)",
        [
          cid,
          amb,
          sez,
          "",
          descr,
          amb === "CE" ? tipo || tipoDef[sez] || "F" : "",
          ord,
        ],
      );
    };
    const imposta = (voceId, valori) =>
      valori.forEach(
        (x, i) =>
          x != null &&
          db.run(
            "INSERT OR REPLACE INTO valori (voce_id, anno, importo) VALUES (?,?,?)",
            [voceId, ANNI[i], x],
          ),
      );
    const riga = (sez, descr, valori, tipo) =>
      imposta(aggiungi(sez, descr, tipo), valori);
    const esistente = (sez, descr, valori) =>
      imposta(trova(sez, descr), valori);

    /* ── CONTO ECONOMICO ── */
    riga("C_RICAVI", "Vendite prodotti", [1800000, 1950000, 2100000]);
    const servizi = aggiungi("C_RICAVI", "Prestazioni di servizi", "IP");
    imposta(servizi, [200000, 210000, 230000]);
    esistente("C_RIM_INIZ", "RIMANENZE INIZIALI", [90000, 100000, 110000]);
    esistente("C_RIM_FIN", "RIMANENZE FINALI", [100000, 110000, 120000]);
    riga("C_ACQUISTI", "Acquisti merci", [900000, 960000, 1040000]);
    riga("C_ACQUISTI", "Acquisti materiali di consumo", [40000, 42000, 45000]);
    riga("C_PRODUTTIVI", "Lavorazioni di terzi", [120000, 130000, 140000], "V");
    riga("C_PRODUTTIVI", "Energia elettrica", [30000, 32000, 35000], "F");
    riga("C_PRODUTTIVI", "Manutenzioni", [18000, 20000, 22000], "F");
    riga("C_PERSONALE", "Salari e stipendi", [350000, 370000, 390000]);
    riga("C_PERSONALE", "Contributi sociali", [105000, 111000, 117000]);
    riga("C_PERSONALE", "Accantonamento TFR", [25000, 26000, 27000]);
    riga("C_COMMERCIALI", "Provvigioni passive", [40000, 43000, 48000], "V");
    const pubblicita = aggiungi("C_COMMERCIALI", "Pubblicità", "F");
    imposta(pubblicita, [20000, 22000, 25000]);
    riga("C_COMMERCIALI", "Trasporti su vendite", [25000, 27000, 30000], "V");
    riga("C_AMMINISTRATIVI", "Consulenze", [30000, 32000, 33000]);
    riga("C_AMMINISTRATIVI", "Assicurazioni", [12000, 12000, 13000]);
    riga("C_AMMINISTRATIVI", "Spese generali", [22000, 23000, 25000]);
    esistente("C_AMMORTAMENTI", "AMM. MAT", [45000, 48000, 50000]);
    esistente("C_AMMORTAMENTI", "AMM. IMM", [10000, 10000, 10000]);
    riga("C_ONERI_TRIB", "IMU e tributi locali", [8000, 8000, 9000]);
    riga("C_ONERI_FIN", "Interessi passivi su mutui", [22000, 20000, 18000]);
    riga("C_ONERI_FIN", "Interessi passivi c/c", [12000, 11000, 10000]);
    riga("C_PROVENTI_FIN", "Interessi attivi", [1000, 1000, 2000]);
    riga("C_RICAVI_EXTRA", "Sopravvenienze attive", [3000, 0, 5000]);
    riga("C_COSTI_EXTRA", "Sopravvenienze passive", [2000, 4000, 1000]);
    esistente(
      "C_IMPOSTE",
      "IMPOSTE ESERCIZIO (IRES - IRAP)",
      [25000, 30000, 38000],
    );

    /* ── STATO PATRIMONIALE (scala sui tre anni) ── */
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

    /* ── ESERCIZIO 2025: derivato dal 2024 con crescite per sezione e alcuni valori puntuali ── */
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

    // Risultato d'esercizio = utile del C.E.; Riserva straordinaria = quadratura (Check = 0)
    const ds = Calc.buildDs(loadRaw(cid));
    const rRis = trova("P_PN", "RISULTATO D'ESERCIZIO");
    const rRiserva = trova("P_PN", "RISERVA STRAORDINARIA");
    ANNI.forEach((a) => {
      const utile = Math.round(Calc.ceYear(ds, a).utile);
      db.run(
        "INSERT OR REPLACE INTO valori (voce_id, anno, importo) VALUES (?,?,?)",
        [rRis, a, utile],
      );
    });
    const ds2 = Calc.buildDs(loadRaw(cid));
    ANNI.forEach((a) => {
      const sp = Calc.spYear(ds2, a);
      db.run(
        "INSERT OR REPLACE INTO valori (voce_id, anno, importo) VALUES (?,?,?)",
        [rRiserva, a, Math.round(-sp.check)],
      );
    });

    /* ── VENDITE MENSILI ── */
    const stag = [6, 6.5, 7.5, 8, 9, 9.5, 8, 4.5, 9, 10, 11, 11];
    const tot = [2000000, 2160000, 2330000, 2490000];
    ANNI.forEach((a, i) =>
      stag.forEach((p, m) =>
        db.run(
          "INSERT OR REPLACE INTO vendite (cliente_id, anno, mese, importo) VALUES (?,?,?,?)",
          [cid, a, m + 1, Math.round((tot[i] * p) / 100)],
        ),
      ),
    );

    /* ── PARAMETRI BUDGET 2025, INVESTIMENTI, CASH FLOW ── */
    db.run(
      "UPDATE parametri_anno SET inflazione=2, produttivita=1, imposte_budget=40000, investimento=500000, aumento_utile=50000, saldo_iniziale_cf=165000 WHERE cliente_id=? AND anno=2024",
      [cid],
    );
    db.run(
      "UPDATE parametri_anno SET inflazione=1.8, produttivita=1.2, imposte_budget=46000, investimento=300000, aumento_utile=40000, saldo_iniziale_cf=190000 WHERE cliente_id=? AND anno=2025",
      [cid],
    );
    db.run(
      "INSERT OR REPLACE INTO budget_var (voce_id, anno, valore) VALUES (?,?,?)",
      [servizi, 2024, 1.1],
    ); // servizi +10%
    db.run(
      "INSERT OR REPLACE INTO budget_var (voce_id, anno, valore) VALUES (?,?,?)",
      [pubblicita, 2024, 5000],
    ); // +5.000 € pubblicità
    db.run(
      "INSERT OR REPLACE INTO budget_var (voce_id, anno, valore) VALUES (?,?,?)",
      [servizi, 2025, 1.05],
    ); // servizi +5%
    db.run(
      "INSERT OR REPLACE INTO budget_var (voce_id, anno, valore) VALUES (?,?,?)",
      [pubblicita, 2025, 3000],
    ); // +3.000 € pubblicità

    const cfAnno = (
      anno,
      tot,
      forn,
      salari,
      iva,
      inps,
      energia,
      consul,
      rata,
    ) => {
      const cf = (sez, descr, importi) => {
        const id = trova(sez, descr);
        importi.forEach(
          (x, m) =>
            x != null &&
            db.run(
              "INSERT OR REPLACE INTO cashflow (voce_id, anno, mese, importo) VALUES (?,?,?,?)",
              [id, anno, m + 1, x],
            ),
        );
      };
      const sc = (t) =>
        stag.map((p) => Math.round((t * p) / 100 / 1000) * 1000);
      cf("CF_E_GESTIONE", "Incassi da Crediti Verso Clienti", sc(tot));
      cf(
        "CF_U_FORNITORI",
        "Fornitori",
        sc(forn).map((x) => -x),
      );
      cf("CF_U_SALARI", "Salari e stipendi", Array(12).fill(-salari));
      cf("CF_U_F24", "Versamento IVA", [
        -iva[0],
        null,
        null,
        -iva[1],
        null,
        null,
        -iva[2],
        null,
        null,
        -iva[3],
        null,
        null,
      ]);
      cf("CF_U_F24", "Dipendenti + Co.Co.Co.", Array(12).fill(-inps));
      cf("CF_U_ALTRE", "Energia Elettrica", Array(12).fill(-energia));
      cf("CF_U_ALTRE", "Consulenze Amministrative", Array(12).fill(-consul));
      cf("CF_U_RATE", "Rata Finanziamento Banca 1", Array(12).fill(-rata));
    };
    cfAnno(
      2024,
      2400000,
      1300000,
      33000,
      [25000, 22000, 20000, 28000],
      9500,
      3000,
      2750,
      4500,
    );
    cfAnno(
      2025,
      2580000,
      1390000,
      34500,
      [27000, 24000, 22000, 30000],
      10000,
      3200,
      2900,
      4500,
    );

    return { id: cid, ragione_sociale: "Azienda Demo S.r.l.", anno_base: 2025 };
  });
}

module.exports = { creaDemo };
