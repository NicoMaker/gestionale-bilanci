/* ═══════════════════════════════════════════════════════════════
   TEMPLATE — struttura del bilancio (ricavata dal file WSN045)
   Usato sia dal backend (seed) sia dal frontend (render / calcoli).
   ═══════════════════════════════════════════════════════════════ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Template = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // Tipi riga (colonna "Tipo" del Conto Economico) — legenda del Budget
  const TIPI = [
    { v: "IP", d: "IP — Inflazione + Produttività" },
    { v: "I", d: "I — Inflazione prevista" },
    { v: "P", d: "P — Maggior produttività prevista" },
    { v: "O", d: "O — Valore come anno precedente" },
    { v: "Z", d: "Z — Valore azzerato" },
    { v: "V", d: "V — Spese variabili" },
    { v: "F", d: "F — Spese fisse" },
  ];

  // ambito SP: stato patrimoniale | CE: conto economico | CF: cash flow
  // def = voci predefinite (descrizione) ; tipo = tipo di default delle nuove righe
  // single = una sola riga (non si possono aggiungere/eliminare righe)
  const SEZIONI = {
    SP: [
      {
        id: "A_IMM_IMM",
        lato: "A",
        label: "Immobilizzazioni Immateriali",
        tot: "Totale Immobilizzazioni Immateriali",
        def: ["F.DO AMM."],
      },
      {
        id: "A_IMM_MAT",
        lato: "A",
        label: "Immobilizzazioni Materiali",
        tot: "Totale Imm. Materiali",
        def: ["F.DO AMM."],
      },
      {
        id: "A_IMM_FIN",
        lato: "A",
        label: "Immobilizzazioni Finanziarie",
        tot: "Totale Immobilizzazioni Finanziarie",
        def: ["TITOLI/AZIONI", "CAUZIONI"],
      },
      {
        id: "A_RIMANENZE",
        lato: "A",
        label: "Rimanenze Merce",
        tot: "Totale Rimanenze Merce",
        def: ["MERCI"],
      },
      {
        id: "A_CRED_ENTRO",
        lato: "A",
        label: "Crediti Esigibili Entro l'Esercizio Successivo",
        tot: "Totale Crediti Esigibili Entro l'Esercizio Successivo",
        def: ["CLIENTI"],
      },
      {
        id: "A_CRED_OLTRE",
        lato: "A",
        label: "Crediti Esigibili Oltre l'Esercizio Successivo",
        tot: "Totale Crediti Esigibili Oltre l'Esercizio Successivo",
        def: [],
      },
      {
        id: "A_LIQUIDITA",
        lato: "A",
        label: "Liquidità Immediate",
        tot: "Totale liquidità Immediate",
        def: ["CASSA", "BANCHE"],
      },
      {
        id: "A_RISCONTI",
        lato: "A",
        label: "Ratei e Risconti Attivi",
        tot: "Totale Ratei e Risconti Attivi",
        def: ["RISCONTI ATTIVI"],
      },
      {
        id: "P_PN",
        lato: "P",
        label: "Patrimonio Netto",
        tot: "Totale Patrimonio Netto",
        def: [
          "CAPITALE SOCIALE",
          "RISERVA LEGALE",
          "RISERVA STRAORDINARIA",
          "RISULTATO D'ESERCIZIO",
        ],
      },
      {
        id: "P_CONS_VARIE",
        lato: "P",
        label: "Passività Consolidate Varie",
        tot: "Totale Passività Consolidate Varie",
        def: [
          "FINANZIAM SOCI",
          "FONDO SVALUT CREDITI",
          "FONDO ACCANTONAMENTO IMPOSTE",
          "FDO TFR",
          "FDO TFM",
        ],
      },
      {
        id: "P_FINANZ",
        lato: "P",
        label: "Finanziamenti",
        tot: "Totale Mutui e Finanziamenti",
        def: ["MUTUI", "DEPOSITI CAUZIONALI RICEVUTI", "ALTRI PRESTITI"],
      },
      {
        id: "P_BANCHE",
        lato: "P",
        label: "Banche entro i 12 mesi",
        tot: "Totale Banche entro i 12 mesi",
        def: ["BANCA C/C"],
      },
      {
        id: "P_CORR_VARIE",
        lato: "P",
        label: "Passività Correnti Varie",
        tot: "Totale Passività Correnti Varie",
        def: ["FORNITORI"],
      },
    ],
    CE: [
      {
        id: "C_RICAVI",
        label: "Ricavi",
        tot: "Totale Ricavi",
        tipo: "IP",
        def: [],
      },
      {
        id: "C_RIM_INIZ",
        label: "Rimanenze Iniziali",
        tot: "Totale Rimanenze Iniziali",
        tipo: "O",
        single: true,
        def: ["RIMANENZE INIZIALI"],
      },
      {
        id: "C_ACQUISTI",
        label: "Acquisti",
        tot: "Totale Acquisti",
        tipo: "IP",
        def: [],
      },
      {
        id: "C_RIM_FIN",
        label: "Rimanenze Finali",
        tot: "Totale Rimanenze Finali",
        tipo: "O",
        single: true,
        def: ["RIMANENZE FINALI"],
      },
      {
        id: "C_PRODUTTIVI",
        label: "Costi Produttivi",
        tot: "Totale Costi Produttivi",
        tipo: "F",
        def: [],
      },
      {
        id: "C_PERSONALE",
        label: "Costo del Personale",
        tot: "Totale Costo del Personale",
        tipo: "F",
        def: [],
      },
      {
        id: "C_COMMERCIALI",
        label: "Costi Commerciali",
        tot: "Totale Costi Commerciali",
        tipo: "F",
        def: [],
      },
      {
        id: "C_AMMINISTRATIVI",
        label: "Costi Amministrativi",
        tot: "Totale Costi Amministrativi",
        tipo: "F",
        def: [],
      },
      {
        id: "C_AMMORTAMENTI",
        label: "Ammortamenti",
        tot: "Totale Ammortamenti",
        tipo: "F",
        def: ["AMM. MAT", "AMM. IMM"],
      },
      {
        id: "C_ONERI_TRIB",
        label: "Oneri Tributari",
        tot: "Totale Oneri Tributari",
        tipo: "F",
        def: [],
      },
      {
        id: "C_ONERI_FIN",
        label: "Oneri Finanziari",
        tot: "Totale Oneri Finanziari",
        tipo: "F",
        def: [],
      },
      {
        id: "C_PROVENTI_FIN",
        label: "Proventi Finanziari",
        tot: "Totale Proventi Finanziari",
        tipo: "F",
        def: [],
      },
      {
        id: "C_RICAVI_EXTRA",
        label: "Ricavi Extra Gestionali",
        tot: "Totale Ricavi Extra gestionali",
        tipo: "Z",
        def: [],
      },
      {
        id: "C_COSTI_EXTRA",
        label: "Costi Extra Gestionali",
        tot: "Totale Costi Extra Gestionali",
        tipo: "Z",
        def: [],
      },
      {
        id: "C_IMPOSTE",
        label: "Imposte",
        tot: "IMPOSTE ESERCIZIO (IRES - IRAP)",
        tipo: "",
        single: true,
        hidden: true,
        def: ["IMPOSTE ESERCIZIO (IRES - IRAP)"],
      },
    ],
    CF: [
      {
        id: "CF_E_MUTUI",
        dir: "E",
        label: "Erogazione Mutui / Finanziamenti",
        def: ["Erogazione Mutuo"],
      },
      {
        id: "CF_E_SOCI",
        dir: "E",
        label: "Incassi da Finanziamenti Propri",
        def: ["Apporto Soci"],
      },
      {
        id: "CF_E_GESTIONE",
        dir: "E",
        label: "Incassi dalla Gestione",
        def: ["Incassi da Crediti Verso Clienti"],
      },
      {
        id: "CF_E_ALTRE",
        dir: "E",
        label: "Altre Entrate",
        def: [
          "Credito di Imposta",
          "Piani di Rientro Clienti",
          "Liquidazioni trimestrali Interessi",
          "Clienti C/Caparre",
          "Rimborsi Assicurativi",
        ],
      },
      {
        id: "CF_U_SALARI",
        dir: "U",
        label: "Salari / Stipendi / Emolumenti",
        def: ["Salari e stipendi", "Emolumento Amministratore"],
      },
      {
        id: "CF_U_FORNITORI",
        dir: "U",
        label: "Fornitori e Lavorazioni di Terzi",
        def: ["Fornitori"],
      },
      {
        id: "CF_U_F24",
        dir: "U",
        label: "F24",
        def: [
          "Versamento Imposte e Tasse",
          "Versamento IVA",
          "Dipendenti + Co.Co.Co.",
          "Ritenute Professionisti",
        ],
      },
      {
        id: "CF_U_ALTRE",
        dir: "U",
        label: "Altre Spese",
        def: [
          "Canoni Manutenzione",
          "Assicurazioni Automezzi",
          "Carburanti Automezzi",
          "Bolli Automezzi",
          "Riparazione e Manutenzione Automezzi",
          "Revisioni Automezzi",
          "Pedaggi Autostradali",
          "Attrezzature",
          "Noleggio Attrezzature",
          "Assicurazioni Diverse",
          "Carburante Autovettura",
          "Assicurazione Autovettura",
          "Bollo Autovettura",
          "Riparazione e Manutenzione Autovettura",
          "Revisione Autovettura",
          "Energia Elettrica",
          "Telefoniche",
          "Canoni, Manutenzione Programmi",
          "Consulenze Amministrative",
          "Consulenze Legali e Notarili",
          "Spese Condominiali",
          "Quote Associative",
          "Materiale Igienico",
          "Manutenzione Attrezzature",
          "Spese Trasporto",
          "Visite Mediche",
          "Cancelleria e Stampati",
          "Postali - Valori bollati - Visure camerali",
          "Manutenzione Estintori",
          "Provvigioni Passive",
          "Ammende e multe",
          "Canoni Leasing",
          "Corsi di Aggiornamento",
        ],
      },
      {
        id: "CF_U_RATE",
        dir: "U",
        label: "Rate Mutui / Finanziamenti / Rientri",
        def: [
          "Rata Finanziamento Banca 1",
          "Rata Finanziamento Banca 2",
          "Rimborso Apporto Soci",
          "Rateazione Agenzia Entrate",
        ],
      },
    ],
  };

  const MESI = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  const MESI_BREVI = [
    "GEN.",
    "FEB.",
    "MAR.",
    "APR.",
    "MAG.",
    "GIU.",
    "LUG.",
    "AGO.",
    "SET.",
    "OTT.",
    "NOV.",
    "DIC.",
  ];

  // sezioni del C.E. comprese nell'intervallo righe 117..420 usato dai SUMIF fisse/variabili
  const CE_SCOPE_COSTI = [
    "C_PRODUTTIVI",
    "C_PERSONALE",
    "C_COMMERCIALI",
    "C_AMMINISTRATIVI",
    "C_AMMORTAMENTI",
    "C_ONERI_TRIB",
    "C_ONERI_FIN",
    "C_PROVENTI_FIN",
    "C_RICAVI_EXTRA",
    "C_COSTI_EXTRA",
  ];

  function tuttiLeSezioni() {
    const out = [];
    for (const ambito of Object.keys(SEZIONI))
      for (const s of SEZIONI[ambito]) out.push({ ambito, ...s });
    return out;
  }

  return { TIPI, SEZIONI, MESI, MESI_BREVI, CE_SCOPE_COSTI, tuttiLeSezioni };
});
