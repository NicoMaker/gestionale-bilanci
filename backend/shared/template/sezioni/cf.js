/* Cash Flow: gruppi di entrate (E) e uscite (U) con le voci predefinite. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else {
    root.Template = root.Template || {};
    root.Template.SEZIONI = root.Template.SEZIONI || {};
    root.Template.SEZIONI.CF = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  return [
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
  ];
});
