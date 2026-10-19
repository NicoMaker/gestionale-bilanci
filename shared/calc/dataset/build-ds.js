/* buildDs: trasforma le righe del database nella struttura usata dai calcoli. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(require("../../template"), {});
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  function buildDs(raw) {
    const ds = {
      voci: raw.voci || [],
      val: {},
      bvar: {},
      vend: {},
      par: {},
      cf: {},
    };
    for (const r of raw.valori || [])
      (ds.val[r.voce_id] = ds.val[r.voce_id] || {})[r.anno] = r.importo;
    for (const r of raw.budget_var || [])
      (ds.bvar[r.voce_id] = ds.bvar[r.voce_id] || {})[r.anno] = r.valore;
    for (const r of raw.vendite || []) {
      const a = (ds.vend[r.anno] = ds.vend[r.anno] || Array(12).fill(0));
      a[r.mese - 1] = r.importo;
    }
    for (const r of raw.parametri || []) ds.par[r.anno] = r;
    for (const r of raw.cashflow || []) {
      const o = (ds.cf[r.voce_id] = ds.cf[r.voce_id] || {});
      const a = (o[r.anno] = o[r.anno] || Array(12).fill(0));
      a[r.mese - 1] = r.importo;
    }
    return ds;
  }

  return { buildDs };
});
