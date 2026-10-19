/* Budget: fattori per tipo riga, variazioni manuali e previsione dell'anno successivo. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("../../template"),
      Object.assign({}, require("../helpers"), require("../bilancio/ce")),
    );
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  const { n, div, up, round8, vociSez, valore, sumSez, par } = C;
  const { sumTipo, aggregate, ceYear } = C;

  function fattore(tipo, i, p) {
    switch (up(tipo)) {
      case "I":
        return 1 + i / 100;
      case "P":
        return 1 + p / 100;
      case "O":
        return 1;
      case "IP":
        return (1 + i / 100) * (1 + p / 100);
      case "Z":
        return 0;
      case "F":
        return 1 + i / 100;
      case "V":
        return (1 + i / 100) * (1 + p / 100);
      default:
        return 0;
    }
  }
  const budgetValore = (C, F, G) =>
    !G ? C * F : G - Math.trunc(G) > 0 ? C * G : C + G;

  function budget(ds, Y) {
    const P = par(ds, Y);
    const cons = ceYear(ds, Y); // consolidato anno Y (colonna "C")
    const righe = {};
    const SH = {};
    for (const s of Template.SEZIONI.CE) {
      if (s.id === "C_IMPOSTE") continue;
      let h = 0;
      for (const v of vociSez(ds, s.id)) {
        const C = valore(ds, v.id, Y);
        const G = n(ds.bvar && ds.bvar[v.id] && ds.bvar[v.id][Y]);
        const F = fattore(v.tipo, P.inflazione, P.produttivita);
        const H = budgetValore(C, F, G);
        righe[v.id] = { C, G, F, H };
        h += H;
      }
      SH[s.id] = h;
    }
    SH.C_IMPOSTE = 0;
    // Rimanenze: iniziali budget = finali consolidate ; finali budget = finali consolidate
    SH.C_RIM_INIZ = cons.sez.C_RIM_FIN;
    SH.C_RIM_FIN = cons.sez.C_RIM_FIN;
    // Costo materie prime budget = % consolidata sul fatturato × fatturato budget
    const mpPct = cons.ricavi ? cons.costo_mp / cons.ricavi : 0;
    const mpBud = mpPct * SH.C_RICAVI;
    // Spese fisse/variabili budget: per tipo su valori budget (Excel H392: solo "F", niente "o")
    const fissiH = sumTipo(ds, Y, ["F"], (v) =>
      righe[v.id] ? righe[v.id].H : 0,
    );
    const varH = sumTipo(ds, Y, ["V"], (v) =>
      righe[v.id] ? righe[v.id].H : 0,
    );
    const bud = aggregate(SH, n(P.imposte_budget), fissiH, varH, mpBud);
    // Consolidato "colonna C" del foglio Budget: spese fisse = F + o (C392)
    const fissiC = sumTipo(ds, Y, ["F", "O"], (v) => valore(ds, v.id, Y));
    const consB = aggregate(
      Object.assign({}, cons.sez),
      cons.imposte,
      fissiC,
      sumTipo(ds, Y, ["V"], (v) => valore(ds, v.id, Y)),
    );
    return {
      anno: Y + 1,
      rif: Y,
      inflazione: P.inflazione,
      produttivita: P.produttivita,
      righe,
      sez: SH,
      sezC: cons.sez,
      C: consB,
      H: bud,
    };
  }

  return { fattore, budgetValore, budget };
});
