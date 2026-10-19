/* Cash Flow: piano di tesoreria a 12 mesi (entrate, uscite, liquidità). */
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
  const { n, div, up, round8, vociSez, valore, sumSez, par } = C;

  function cashflow(ds, Y) {
    const P = par(ds, Y);
    const cfv = (id, m) =>
      n(ds.cf && ds.cf[id] && ds.cf[id][Y] && ds.cf[id][Y][m]);
    const groups = Template.SEZIONI.CF.map((g) => {
      const voci = vociSez(ds, g.id);
      const tot = Array.from({ length: 12 }, (_, m) =>
        voci.reduce((s, v) => s + cfv(v.id, m), 0),
      );
      return { id: g.id, dir: g.dir, voci, tot };
    });
    const entrate = Array.from({ length: 12 }, (_, m) =>
      groups.filter((g) => g.dir === "E").reduce((s, g) => s + g.tot[m], 0),
    );
    const uscite = Array.from({ length: 12 }, (_, m) =>
      groups.filter((g) => g.dir === "U").reduce((s, g) => s + g.tot[m], 0),
    );
    const saldo = [],
      liq = [];
    for (let m = 0; m < 12; m++) {
      saldo[m] = m === 0 ? n(P.saldo_iniziale_cf) : liq[m - 1];
      liq[m] = saldo[m] + entrate[m] + uscite[m];
    }
    return { anno: Y + 1, rif: Y, groups, entrate, uscite, saldo, liq, cfv };
  }

  return { cashflow };
});
