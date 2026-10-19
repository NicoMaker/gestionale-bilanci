/* Riepilogo cliente: una riga per anno (ricavi, EBITDA, utile, rating, indici). */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("../template"),
      Object.assign({}, require("./anni"), require("./year-data")),
    );
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  const { anni, yearData } = C;

  function riepilogo(ds) {
    const anni_ = anni(ds);
    return anni_.map((a) => {
      const d = yearData(ds, a);
      return {
        anno: a,
        ricavi: d.ce.ricavi,
        ebitda: d.ce.ebitda,
        ebit: d.ce.ebit,
        utile: d.ce.utile,
        attivo: d.sp.totale_attivo,
        pn: d.sp.pn,
        check: d.sp.check,
        rating: d.rating.rating,
        punteggio: d.rating.punteggio,
        vuoto: d.rating.vuoto,
        roe: d.ind.roe,
        ros: d.ind.ros,
        current_ratio: d.ind.current_ratio,
      };
    });
  }

  return { riepilogo };
});
