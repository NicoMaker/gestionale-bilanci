/* Sezioni del C.E. comprese nell'intervallo 117..420 usato dai SUMIF delle spese fisse/variabili. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else {
    root.Template = root.Template || {};
    root.Template.CE_SCOPE_COSTI = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  // sezioni del C.E. comprese nell'intervallo righe 117..420 usato dai SUMIF fisse/variabili
  return [
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
});
