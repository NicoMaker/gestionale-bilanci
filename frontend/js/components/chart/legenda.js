/* Legenda del grafico (pallino colore + nome di ogni serie). */
(function () {
  const GB = window.GB;

  GB.chartLegend = function (bars, lines) {
    return GB.h(
      "div",
      { class: "legend" },
      [...bars, ...lines].map((x) =>
        GB.h(
          "span",
          null,
          GB.h("i", { style: { background: x.color || "var(--accent)" } }),
          x.name,
        ),
      ),
    );
  };
})();
