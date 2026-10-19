/* Dati completi di un esercizio: S.P., C.E., rating e indicatori. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("../../template"),
      Object.assign(
        {},
        require("../bilancio/sp"),
        require("../bilancio/ce"),
        require("../bilancio/rating"),
        require("../bilancio/indicatori"),
      ),
    );
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  const { spYear, ceYear, ratingYear, indicatoriYear } = C;

  function yearData(ds, a) {
    const sp = spYear(ds, a),
      ce = ceYear(ds, a);
    return {
      anno: a,
      sp,
      ce,
      rating: ratingYear(sp, ce),
      ind: indicatoriYear(sp, ce),
    };
  }

  return { yearData };
});
