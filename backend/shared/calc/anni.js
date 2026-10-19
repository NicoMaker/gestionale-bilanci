/* Elenco degli anni per cui il cliente ha parametri o dati. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("../template"),
      Object.assign({}, require("./helpers")),
    );
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  function anni(ds) {
    const set = new Set(Object.keys(ds.par || {}).map(Number));
    for (const id of Object.keys(ds.val || {}))
      for (const a of Object.keys(ds.val[id])) set.add(Number(a));
    for (const a of Object.keys(ds.vend || {})) set.add(Number(a));
    return [...set].filter((x) => x > 1900).sort((a, b) => a - b);
  }

  return { anni };
});
