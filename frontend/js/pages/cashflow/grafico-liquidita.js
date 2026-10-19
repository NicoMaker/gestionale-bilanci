/* Grafico dell'andamento della liquidità: barre entrate/uscite e linea della liquidità banca. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.cashflow.grafico = function (CF) {
    const chartBox = h("div", { class: "card-b" });
    const draw = () =>
      chartBox.replaceChildren(
        GB.chart({
          labels: T.MESI.map((m) => m.slice(0, 3)),
          bars: [
            { name: "Entrate", color: "var(--green)", values: CF().entrate },
            { name: "Uscite", color: "var(--red)", values: CF().uscite },
          ],
          lines: [
            {
              name: "Liquidità banca",
              color: "var(--accent)",
              values: CF().liq,
            },
          ],
          height: 280,
        }),
      );
    draw();
    return { box: chartBox, draw };
  };
})();
