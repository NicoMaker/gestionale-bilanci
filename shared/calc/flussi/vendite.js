/* Vendite: ricavi mensili su 3 anni, pesi, fattore medio ponderato, stagionalità e progressiva. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("../../template"),
      Object.assign({}, require("../helpers")),
    );
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  const { n, div, up, round8, vociSez, valore, sumSez, par } = C;

  function vendite(ds, Y) {
    const years = [Y - 2, Y - 1, Y];
    const w = years.map((a) => n(par(ds, a).peso_vendite));
    const sw = w[0] + w[1] + w[2];
    const v = years.map((a) =>
      Array.from({ length: 12 }, (_, m) =>
        n(ds.vend && ds.vend[a] && ds.vend[a][m]),
      ),
    );
    const tot = v.map((col) => col.reduce((s, x) => s + x, 0));
    const wavg = (a, b, c) => (sw ? (a * w[0] + b * w[1] + c * w[2]) / sw : 0);
    const ft = Array.from({ length: 12 }, (_, m) =>
      wavg(v[0][m], v[1][m], v[2][m]),
    );
    const ftTot = wavg(tot[0], tot[1], tot[2]);
    const stag = ft.map((x) => (ftTot ? round8((x / ftTot) * 100) : 0));
    let acc = 0;
    const prog = stag.map((x) => (acc += x));
    return {
      years,
      pesi: w,
      somma_pesi: sw,
      v,
      tot,
      ft,
      ft_tot: ftTot,
      stag,
      prog,
      stag_tot: stag.reduce((s, x) => s + x, 0),
    };
  }

  return { vendite };
});
