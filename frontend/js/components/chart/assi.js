/* Assi del grafico: griglia, valori dell'asse sinistro/destro, etichette delle categorie e linea dello zero. */
(function () {
  const GB = window.GB;

  GB.chartAxes = function (svg, g, fmt, fmt2) {
    const s = GB.svg;
    const { W, H, L, R, slot, y1, y2, sc1, sc2, labels } = g;
    sc1.vals.forEach((v) => {
      svg.append(
        s("line", { x1: L, x2: W - R, y1: y1(v), y2: y1(v), class: "grid" }),
      );
      svg.append(
        s("text", { x: L - 6, y: y1(v) + 4, "text-anchor": "end" }, fmt(v)),
      );
    });
    if (sc2)
      sc2.vals.forEach((v) =>
        svg.append(
          s(
            "text",
            { x: W - R + 6, y: y2(v) + 4, "text-anchor": "start" },
            fmt2(v),
          ),
        ),
      );
    labels.forEach((lb, i) =>
      svg.append(
        s(
          "text",
          { x: L + slot * i + slot / 2, y: H - 10, "text-anchor": "middle" },
          lb,
        ),
      ),
    );
  };

  GB.chartZero = function (svg, g) {
    const s = GB.svg;
    const { W, L, R, y1 } = g;
    svg.append(
      s("line", {
        x1: L,
        x2: W - R,
        y1: y1(0),
        y2: y1(0),
        style: { stroke: "var(--b2)" },
        "stroke-width": 1,
      }),
    );
  };
})();
