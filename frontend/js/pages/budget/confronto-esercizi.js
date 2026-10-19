/* Confronto di tutti gli esercizi: consolidato e budget dell'anno successivo (tabella multi-anno + grafico). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.budget.confronto = function () {
    const S = GB.store;
    const mrow = (label, key, cls, kind) => ({
      label,
      cls: cls || "line",
      kind: kind || "num",
      get: (e, v) => e.bud[v][key],
    });
    const multi = GB.multiTable({
      title: "Budget di tutti gli esercizi",
      hint: "clicca un esercizio per aprirlo",
      note: "Per ogni esercizio trovi il consolidato e il budget dell'anno successivo, calcolato con i parametri (inflazione, produttività, variazioni manuali) di quell'esercizio. L'anno di riferimento è evidenziato.",
      first: "Ricavi e Costi",
      head: (e) => `Esercizio ${e.anno}`,
      subs: (e) => [
        { label: "Consolidato", v: "C" },
        { label: "Budget " + (e.anno + 1), v: "H" },
      ],
      rows: [
        mrow("Ricavi", "ricavi", "sub"),
        mrow("Costo delle materie prime", "costo_mp"),
        mrow("Costo del venduto", "costo_venduto"),
        mrow("1° margine operativo", "margine1", "big"),
        mrow("Totale costi operativi", "costi_operativi"),
        mrow("EBITDA", "ebitda", "big"),
        mrow("EBIT (2° margine operativo)", "ebit", "big"),
        mrow("Risultato gestionale", "risultato_gest"),
        mrow("Utile ante imposte", "ante_imposte"),
        mrow("Imposte", "imposte"),
        mrow("Utile di bilancio", "utile", "grand"),
        { t: "sec", label: "Punto di pareggio (BEP)" },
        mrow("Spese fisse", "spese_fisse"),
        mrow("Spese variabili", "spese_var"),
        mrow("% punto di pareggio", "bep_pct", "line", "pt"),
        mrow("Fatturato minimo per BEP", "bep_fatturato", "sub"),
        {
          label: "Data BEP aziendale",
          cls: "line",
          kind: "text",
          get: (e, v) => {
            const d = window.Calc.dayLabel(e.bud[v].bep_giorno);
            return d
              ? d.oltre
                ? "oltre il 31 dic"
                : d.giornoMese + " " + T.MESI[d.mese].slice(0, 3).toLowerCase()
              : "";
          },
        },
      ],
    });
    const mChart = h("div", { class: "card-b" });
    const drawMulti = () =>
      mChart.replaceChildren(
        GB.chart({
          labels: S.M.map((e) => `${e.anno} → ${e.anno + 1}`),
          bars: [
            {
              name: "Ricavi consolidati",
              color: "var(--cyan)",
              values: S.M.map((e) => e.bud.C.ricavi),
            },
            {
              name: "Ricavi budget",
              color: "var(--accent)",
              values: S.M.map((e) => e.bud.H.ricavi),
            },
            {
              name: "Utile consolidato",
              color: "var(--yellow)",
              values: S.M.map((e) => e.bud.C.utile),
            },
            {
              name: "Utile budget",
              color: "var(--green)",
              values: S.M.map((e) => e.bud.H.utile),
            },
          ],
          height: 260,
        }),
      );
    drawMulti();
    return { multi, mChart, drawMulti };
  };
})();
