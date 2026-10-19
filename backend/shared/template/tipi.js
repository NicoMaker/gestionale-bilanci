/* Tipi riga (colonna «Tipo» del Conto Economico) — legenda del Budget. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else {
    root.Template = root.Template || {};
    root.Template.TIPI = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  // Tipi riga (colonna "Tipo" del Conto Economico) — legenda del Budget
  return [
    { v: "IP", d: "IP — Inflazione + Produttività" },
    { v: "I", d: "I — Inflazione prevista" },
    { v: "P", d: "P — Maggior produttività prevista" },
    { v: "O", d: "O — Valore come anno precedente" },
    { v: "Z", d: "Z — Valore azzerato" },
    { v: "V", d: "V — Spese variabili" },
    { v: "F", d: "F — Spese fisse" },
  ];
});
