/* Grafico dell'andamento stagionale: barre della stagionalità mensile e linea della progressiva. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.vendite.grafico = function (V) {
    const chartBox = h("div", { class: "card-b" });
    const draw = () => {
      const v = V();
      chartBox.replaceChildren(
        GB.chart({
          labels: T.MESI_BREVI.map((m) => m.slice(0, 3)),
          bars: [
            {
              name: "Stagionalità mensile %",
              color: "var(--accent)",
              values: v.stag,
            },
          ],
          lines: [
            {
              name: "Progressiva %",
              color: "var(--orange)",
              values: v.prog,
              y2: true,
            },
          ],
          fmt: (x) => fmt.num(x, 0) + "%",
          fmt2: (x) => x + "%",
          tipFmt: (x) => fmt.num(x, 2) + " %",
          height: 260,
        }),
      );
    };
    draw();
    return { box: chartBox, draw };
  };
})();
