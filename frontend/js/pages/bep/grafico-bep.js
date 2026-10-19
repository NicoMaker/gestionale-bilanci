/* Diagramma del punto di pareggio: vendite cumulate, costi totali, costi fissi e BEP mese per mese. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.bep.grafico = function (chartBox, P) {
    chartBox.replaceChildren(
      GB.chart({
        labels: P.rows.map((r) => r.label),
        lines: [
          {
            name: "Vendite",
            color: "var(--accent)",
            values: P.rows.map((r) => r.vendite),
          },
          {
            name: "Costi totali",
            color: "var(--red)",
            values: P.rows.map((r) => r.totali),
          },
          {
            name: "Costi fissi",
            color: "var(--yellow)",
            dash: "5 4",
            values: P.rows.map((r) => r.fissi),
            nodots: true,
          },
          {
            name: "BEP",
            color: "var(--green)",
            dash: "2 4",
            values: P.rows.map((r) => r.bep),
            nodots: true,
          },
        ],
        height: 300,
      }),
    );
  };
})();
