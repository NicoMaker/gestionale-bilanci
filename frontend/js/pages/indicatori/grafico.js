/* Grafico «Redditività a confronto» (EBITDA-MOL, ROE, ROI, ROS per anno). */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.indicatori.grafico = function (years) {
    const S = GB.store;
    const chartBox = h("div", { class: "card-b" });
    const card = h(
      "div",
      { class: "card" },
      h(
        "div",
        { class: "card-h" },
        h("h3", null, "Redditività a confronto (%)"),
      ),
      chartBox,
    );
    const drawChart = () => {
      const mk = (k, name, color) => ({
        name,
        color,
        values: years.map((a) => {
          const v = S.R.anni[a].ind[k];
          return v == null ? null : +(v * 100).toFixed(2);
        }),
      });
      chartBox.replaceChildren(
        GB.chart({
          labels: years.map(String),
          bars: [
            mk("ebitda_mol", "EBITDA-MOL", "var(--accent)"),
            mk("roe", "ROE", "var(--green)"),
            mk("roi", "ROI", "var(--orange)"),
            mk("ros", "ROS", "var(--purple)"),
          ],
          fmt: (v) => v + "%",
          height: 240,
        }),
      );
    };
    drawChart();
    return { card, draw: drawChart };
  };
})();
