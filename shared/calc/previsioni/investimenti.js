/* Investimenti: fatturato necessario per coprire un investimento e nuovo budget. */
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

  function investimenti(bud, P) {
    const H = bud.H;
    const r = {};
    r.ricavi = H.ricavi;
    r.costi_var = H.costo_mp + H.spese_var;
    r.differenza = r.ricavi - r.costi_var;
    r.costi_fissi = H.spese_fisse;
    r.utile = r.differenza - r.costi_fissi;
    r.d_ricavi = r.ricavi ? 1 : null;
    r.d_var = div(r.costi_var, r.ricavi);
    r.d_diff = div(r.differenza, r.ricavi);
    r.d_fissi = div(r.costi_fissi, r.ricavi);
    r.d_utile = div(r.utile, r.ricavi);
    r.investimento = n(P.investimento);
    r.aumento_utile = n(P.aumento_utile);
    const m = r.d_diff || 0;
    r.fatturato_necessario =
      m === 0 ? 0 : (r.investimento + r.aumento_utile) / m;
    const E7 = r.fatturato_necessario;
    r.f_fatt = E7 === 0 ? 0 : 1;
    r.f_inv = E7 === 0 ? 0 : r.investimento / E7;
    r.f_aum = E7 === 0 ? 0 : r.aumento_utile / E7;
    // nuovo budget
    r.n_ricavi = r.ricavi + E7;
    r.n_d_ricavi = r.n_ricavi === 0 ? 0 : 1;
    r.n_costi_var = r.n_ricavi * (r.d_var || 0);
    r.n_differenza = r.n_ricavi - r.n_costi_var;
    r.n_costi_fissi = r.costi_fissi + r.investimento;
    r.n_utile = r.n_differenza - r.n_costi_fissi;
    r.n_d_var = r.d_var;
    r.n_d_diff = r.n_ricavi === 0 ? 0 : r.n_differenza / r.n_ricavi;
    r.n_d_fissi = r.n_ricavi === 0 ? 0 : r.n_costi_fissi / r.n_ricavi;
    r.n_d_utile = r.n_ricavi === 0 ? 0 : r.n_utile / r.n_ricavi;
    return r;
  }

  return { investimenti };
});
