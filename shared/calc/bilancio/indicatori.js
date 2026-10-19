/* Indicatori: EBITDA-MOL, ROE, ROI, ROS, margine di tesoreria, current ratio, rotazione magazzino. */
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

  function indicatoriYear(sp, ce) {
    return {
      ebitda_mol: div(
        ce.ricavi -
          (ce.costo_mp +
            ce.produttivi +
            ce.personale +
            ce.commerciali +
            ce.amministrativi +
            ce.oneri_trib),
        ce.ricavi,
      ),
      roe: div(ce.utile, sp.pn),
      roi: div(
        ce.ebit,
        sp.attivo_fisso + sp.attivo_circolante - sp.tot_pass_correnti,
      ),
      ros: div(ce.ebit, ce.ricavi),
      margine_tesoreria: sp.attivo_circolante - sp.tot_pass_correnti,
      current_ratio: div(sp.attivo_circolante, sp.tot_pass_correnti),
      rotazione_magazzino: div(ce.costo_mp, (ce.rim_iniz + ce.rim_fin) / 2),
    };
  }

  return { indicatoriYear };
});
