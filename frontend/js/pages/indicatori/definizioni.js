/* Definizione degli indicatori: chiave, nome, formula in chiaro e tipo di formato. */
(function () {
  const GB = window.GB;

  GB.parts.indicatori = {
    DEFS: [
      {
        k: "ebitda_mol",
        l: "EBITDA – MOL",
        f: "(Ricavi − costi operativi esclusi ammortamenti e oneri finanziari) / Ricavi",
        t: "pct",
      },
      {
        k: "roe",
        l: "ROE",
        f: "Utile di bilancio / Patrimonio netto",
        t: "pct",
      },
      {
        k: "roi",
        l: "ROI",
        f: "EBIT / (Attivo fisso + Attivo circolante − Passività correnti)",
        t: "pct",
      },
      { k: "ros", l: "ROS", f: "EBIT / Ricavi", t: "pct" },
      {
        k: "margine_tesoreria",
        l: "MARGINE DI TESORERIA",
        f: "Attivo circolante − Passività correnti",
        t: "eur",
      },
      {
        k: "current_ratio",
        l: "CURRENT RATIO",
        f: "Attivo circolante / Passività correnti",
        t: "n2",
      },
      {
        k: "rotazione_magazzino",
        l: "ROTAZIONE DEL MAGAZZINO",
        f: "Costo materie prime / media(Rimanenze iniziali; Rimanenze finali)",
        t: "n2",
      },
    ],
  };
})();
