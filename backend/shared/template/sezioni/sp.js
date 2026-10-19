/* Stato Patrimoniale: sezioni di Attivo e Passivo con le voci predefinite. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else {
    root.Template = root.Template || {};
    root.Template.SEZIONI = root.Template.SEZIONI || {};
    root.Template.SEZIONI.SP = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  return [
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
  ];
});
