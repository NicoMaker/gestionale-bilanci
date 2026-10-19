/* Campi «Investimento previsto» e «Richiesta di aumento utile» + indicatore del fatturato necessario. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.investimenti.parametri = function ({ ro, Y, live, I }) {
    const S = GB.store;
    const inp = (campo, val) => {
      const i = GB.numInput(val || null, {
        readonly: ro,
        cls: "w-yr",
        onCommit: (v) => S.saveParam(Y, campo, v === null ? 0 : v),
      });
      i.classList.add("input");
      return i;
    };
    const fatt = h("div", { class: "v" });
    const fatt1 = h("div", { class: "s" });
    live.add(fatt, (e) => {
      e.textContent = fmt.eur(I().fatturato_necessario);
    });
    live.add(fatt1, (e) => {
      const r = I();
      e.textContent = `Investimento ${fmt.pct(r.f_inv)} · aumento utile ${fmt.pct(r.f_aum)} del fatturato necessario`;
    });
    return { inp, fatt, fatt1 };
  };
})();
