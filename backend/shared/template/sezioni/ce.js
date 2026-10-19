/* Conto Economico: sezioni, tipo riga di default e voci predefinite. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else {
    root.Template = root.Template || {};
    root.Template.SEZIONI = root.Template.SEZIONI || {};
    root.Template.SEZIONI.CE = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  return [
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
  ];
});
