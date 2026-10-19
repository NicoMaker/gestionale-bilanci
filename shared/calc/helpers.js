/* Funzioni di utilità comuni a tutti i calcoli (numeri sicuri, indice voci, somme di sezione, parametri). */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(require("../template"), {});
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  const n = (x) => (typeof x === "number" && isFinite(x) ? x : 0);
  const div = (a, b) => (b ? a / b : null);
  const up = (s) =>
    String(s || "")
      .trim()
      .toUpperCase();

  function indexVoci(ds) {
    if (ds._idx && ds._idxSrc === ds.voci) return ds._idx;
    const by = {};
    for (const v of ds.voci) (by[v.sezione] = by[v.sezione] || []).push(v);
    ds._idx = by;
    ds._idxSrc = ds.voci;
    return by;
  }
  const vociSez = (ds, sez) => indexVoci(ds)[sez] || [];
  const valore = (ds, voceId, anno) =>
    n(ds.val && ds.val[voceId] && ds.val[voceId][anno]);
  const sumSez = (ds, sez, anno) =>
    vociSez(ds, sez).reduce((s, v) => s + valore(ds, v.id, anno), 0);
  const par = (ds, anno) =>
    Object.assign(
      {
        peso_vendite: 1,
        inflazione: 0,
        produttivita: 0,
        imposte_budget: 0,
        investimento: 0,
        aumento_utile: 0,
        saldo_iniziale_cf: 0,
      },
      (ds.par && ds.par[anno]) || {},
    );
  const round8 = (x) => Math.round(x * 1e8) / 1e8;

  return { n, div, up, round8, indexVoci, vociSez, valore, sumSez, par };
});
