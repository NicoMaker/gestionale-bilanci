/* Confronto degli investimenti di tutti gli esercizi (tabella multi-anno + grafico utile/fatturato necessario). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.investimenti.confronto = function () {
    const S = GB.store;
    const mrow = (label, key, cls, kind) => ({
      label,
      cls: cls || "line",
      kind: kind || "num",
      get: (e) => e.inv[key],
    });
    const multi = GB.multiTable({
      title: "Investimenti di tutti gli esercizi",
      hint: "clicca un esercizio per aprirlo e modificarne i valori",
      first: "Budget dell'anno successivo",
      head: (e) => `Budget ${e.anno + 1}`,
      sub: (e) => "base " + e.anno,
      rows: [
        { t: "sec", label: "Budget" },
        mrow("Ricavi", "ricavi", "sub"),
        mrow("Costi variabili", "costi_var"),
        mrow("Differenza (volume d'affari − costi variabili)", "differenza"),
        mrow("Costi fissi", "costi_fissi"),
        mrow("Utile", "utile", "big"),
        { t: "sec", label: "Investimento e richiesta di utile" },
        mrow("Investimento previsto", "investimento"),
        mrow("Richiesta di aumento utile", "aumento_utile"),
        mrow("Fatturato necessario", "fatturato_necessario", "big"),
        { t: "sec", label: "Nuovo budget considerando l'investimento" },
        mrow("Ricavi", "n_ricavi", "sub"),
        mrow("Costi variabili", "n_costi_var"),
        mrow("Costi fissi + investimento", "n_costi_fissi"),
        mrow("Utile", "n_utile", "grand"),
      ],
    });
    const mChart = h("div", { class: "card-b" });
    const drawMulti = () =>
      mChart.replaceChildren(
        GB.chart({
          labels: S.M.map((e) => String(e.anno + 1)),
          bars: [
            {
              name: "Utile budget",
              color: "var(--accent)",
              values: S.M.map((e) => e.inv.utile),
            },
            {
              name: "Utile col nuovo investimento",
              color: "var(--green)",
              values: S.M.map((e) => e.inv.n_utile),
            },
            {
              name: "Fatturato necessario",
              color: "var(--orange)",
              values: S.M.map((e) => e.inv.fatturato_necessario),
            },
          ],
          height: 260,
        }),
      );
    drawMulti();
    return { multi, mChart, drawMulti };
  };
})();
