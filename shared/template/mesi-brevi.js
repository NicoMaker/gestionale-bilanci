/* Nomi dei mesi (abbreviati). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else {
    root.Template = root.Template || {};
    root.Template.MESI_BREVI = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  return [
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
});
