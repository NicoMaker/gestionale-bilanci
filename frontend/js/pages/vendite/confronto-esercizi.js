/* Confronto di tutti gli esercizi con vendite (tabella multi-anno e grafico una linea per esercizio). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.vendite.confronto = function () {
    const S = GB.store;
    const vm = (e, m) => (S.ds.vend[e.anno] ? S.ds.vend[e.anno][m] : 0) || 0;
    const vtot = (e) =>
      Array.from({ length: 12 }, (_, m) => vm(e, m)).reduce((s, x) => s + x, 0);
    const multi = GB.multiTable({
      title: "Vendite di tutti gli esercizi",
      hint: "clicca un esercizio per aprirlo",
      note: "Ricavi mensili di tutti gli esercizi del cliente. La media ponderata e la stagionalità qui sopra usano solo l'anno di riferimento e i due precedenti.",
      first: "Mese",
      head: (e) => "ES. " + e.anno,
      rows: [
        ...T.MESI_BREVI.map((mn, m) => ({
          label: mn,
          cls: "line",
          kind: "num",
          get: (e) => vm(e, m) || null,
        })),
        { label: "TOTALE", cls: "grand", kind: "num", get: (e) => vtot(e) },
        {
          label: "Variazione sull'esercizio precedente",
          cls: "sub",
          kind: "pct",
          get: (e) => {
            const p = S.M.find((x) => x.anno === e.anno - 1);
            const pt = p ? vtot(p) : 0;
            return pt ? (vtot(e) - pt) / Math.abs(pt) : null;
          },
        },
      ],
    });
    const mChart = h("div", { class: "card-b" });
    const drawMulti = () =>
      mChart.replaceChildren(
        GB.yearLines({
          labels: T.MESI_BREVI.map((m) => m.slice(0, 3)),
          series: {
            name: (e) => "Es. " + e.anno,
            values: (e) => Array.from({ length: 12 }, (_, m) => vm(e, m)),
          },
          height: 280,
        }),
      );
    drawMulti();
    return { multi, mChart, drawMulti };
  };
})();
