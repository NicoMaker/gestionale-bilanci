/* Grafico «una serie per esercizio» (es. liquidità mensile di ogni anno). */
(function () {
  const GB = window.GB;

  /* grafico "una serie per esercizio" (es. liquidità mensile di ogni anno). series(e) → valori */
  GB.yearLines = function ({ labels, series, height = 260, fmtFn }) {
    const E = GB.store.M || [];
    return GB.chart({
      labels,
      lines: E.map((e, i) => ({
        name: String(series.name ? series.name(e) : e.anno),
        color: GB.yearColor(i),
        values: series.values(e),
        width: e.anno === GB.store.anno ? 3.2 : 2,
      })),
      height,
      fmt: fmtFn || GB.fmt.short,
    });
  };
})();
