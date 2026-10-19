/* Elenco piatto di tutte le sezioni (SP, CE, CF) con l'ambito di appartenenza. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(require("./sezioni"));
  else {
    root.Template = root.Template || {};
    root.Template.tuttiLeSezioni = factory(root.Template.SEZIONI);
  }
})(typeof self !== "undefined" ? self : this, function (SEZIONI) {
  return function tuttiLeSezioni() {
    const out = [];
    for (const ambito of Object.keys(SEZIONI))
      for (const s of SEZIONI[ambito]) out.push({ ambito, ...s });
    return out;
  };
});
