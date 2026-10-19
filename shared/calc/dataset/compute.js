/* Calcolo completo per l'anno Y: tutti gli esercizi + vendite, budget, investimenti, BEP, cash flow. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("../../template"),
      Object.assign(
        {},
        require("../helpers"),
        require("./anni"),
        require("./year-data"),
        require("../flussi/vendite"),
        require("../previsioni/budget"),
        require("../previsioni/investimenti"),
        require("../previsioni/bep"),
        require("../flussi/cashflow"),
      ),
    );
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  const {
    par,
    anni,
    yearData,
    vendite,
    budget,
    investimenti,
    bepData,
    cashflow,
  } = C;

  function compute(ds, Y) {
    const years = [Y - 2, Y - 1, Y]; // finestra usata da vendite/budget
    // tutti gli esercizi da mostrare: quelli con dati + almeno i 3 fino a Y (così un cliente nuovo può compilare anche gli anni precedenti)
    const tutti = [...new Set([...anni(ds), ...years])].sort((a, b) => a - b);
    const out = { Y, years, tutti, anni: {} };
    for (const a of tutti) out.anni[a] = yearData(ds, a);
    out.vend = vendite(ds, Y);
    out.bud = budget(ds, Y);
    out.inv = investimenti(out.bud, par(ds, Y));
    out.bep = bepData(out.bud, out.vend);
    out.cf = cashflow(ds, Y);
    out.par = par(ds, Y);
    return out;
  }

  return { compute };
});
