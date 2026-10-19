/* Store: ricalcolo di tutti i risultati (anno di riferimento + ogni esercizio) e notifica «calc». */
(function () {
  const GB = window.GB;
  const { api } = GB;
  const S = GB.store;
  const DEF_PAR = GB.DEF_PAR;

  Object.assign(S, {
    recompute() {
      if (!S.ds) return;
      S.anni = window.Calc.anni(S.ds);
      S.R = window.Calc.compute(S.ds, S.anno);
      // budget, BEP, investimenti, cash flow e vendite calcolati per OGNI esercizio (non solo per l'anno di riferimento):
      // servono alle tabelle di confronto multi-anno delle pagine
      const C = window.Calc;
      S.M = S.anni.map((a) => {
        const vend = C.vendite(S.ds, a),
          bud = C.budget(S.ds, a),
          P = C.par(S.ds, a);
        return {
          anno: a,
          par: P,
          vend,
          bud,
          inv: C.investimenti(bud, P),
          bep: C.bepData(bud, vend),
          cf: C.cashflow(S.ds, a),
          ce: S.R.anni[a] ? S.R.anni[a].ce : C.yearData(S.ds, a).ce,
        };
      });
    },
    changed() {
      S.recompute();
      S.emit("calc");
    },
  });
})();
