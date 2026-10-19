/* Confronto del punto di pareggio di tutti gli esercizi (tabella multi-anno + grafico). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.bep.confronto = function () {
    const S = GB.store;
    const dataTxt = GB.parts.bep.dataTxt;
    const mrow = (label, get, kind, cls) => ({
      label,
      get,
      kind: kind || "num",
      cls: cls || "line",
    });
    const multi = GB.multiTable({
      title: "Punto di pareggio di tutti gli esercizi",
      hint: "clicca un esercizio per aprirlo",
      first: "Budget dell'anno successivo",
      head: (e) => `Budget ${e.anno + 1}`,
      sub: (e) => "base " + e.anno,
      rows: [
        mrow("Fatturato di budget", (e) => e.bud.H.ricavi, "num", "sub"),
        mrow("Spese fisse", (e) => e.bud.H.spese_fisse),
        mrow(
          "Costi variabili (materie prime + spese variabili)",
          (e) => e.bud.H.costo_mp + e.bud.H.spese_var,
        ),
        mrow(
          "Margine di contribuzione",
          (e) => (e.bud.H.ricavi ? 1 - e.bep.var_pct : null),
          "pct",
        ),
        mrow(
          "Fatturato minimo per BEP",
          (e) => e.bud.H.bep_fatturato,
          "num",
          "big",
        ),
        mrow("% punto di pareggio", (e) => e.bud.H.bep_pct, "pt"),
        mrow(
          "Margine di sicurezza (ricavi − BEP) / ricavi",
          (e) =>
            e.bud.H.ricavi && e.bud.H.bep_fatturato != null
              ? (e.bud.H.ricavi - e.bud.H.bep_fatturato) / e.bud.H.ricavi
              : null,
          "pct",
        ),
        mrow("Data BEP aziendale", (e) => dataTxt(e.bud.H.bep_giorno), "text"),
        mrow(
          "Pareggio raggiunto a",
          (e) =>
            !e.bud.H.ricavi
              ? ""
              : e.bep.mese_pareggio == null
                ? "non raggiunto"
                : T.MESI[e.bep.mese_pareggio],
          "text",
        ),
      ],
    });
    const mChart = h("div", { class: "card-b" });
    const drawMulti = () =>
      mChart.replaceChildren(
        GB.chart({
          labels: S.M.map((e) => String(e.anno + 1)),
          bars: [
            {
              name: "Fatturato di budget",
              color: "var(--accent)",
              values: S.M.map((e) => e.bud.H.ricavi),
            },
            {
              name: "Fatturato minimo BEP",
              color: "var(--green)",
              values: S.M.map((e) => e.bud.H.bep_fatturato),
            },
            {
              name: "Spese fisse",
              color: "var(--yellow)",
              values: S.M.map((e) => e.bud.H.spese_fisse),
            },
          ],
          height: 260,
        }),
      );
    drawMulti();
    return { multi, mChart, drawMulti };
  };
})();
