/* Barre del grafico (una serie per ogni barra affiancata). */
(function () {
  const GB = window.GB;

  GB.chartBars = function (svg, g, bars, labels, attach) {
    const s = GB.svg;
    const { L, slot, y1 } = g;
    const bw = Math.min(46, (slot * 0.7) / Math.max(1, bars.length));
    bars.forEach((b, bi) => {
      b.values.forEach((v, i) => {
        if (v == null) return;
        const x = L + slot * i + slot / 2 - (bw * bars.length) / 2 + bw * bi;
        const yy = y1(Math.max(v, 0)),
          y0 = y1(Math.min(v, 0));
        const rect = s("rect", {
          x,
          y: yy,
          width: bw - 2,
          height: Math.max(1, y0 - yy),
          rx: 2,
          class: "bar",
          style: { fill: b.color || "var(--accent)" },
        });
        attach(rect, () => ({
          name: b.name,
          label: labels[i],
          v,
          color: b.color,
        }));
        svg.append(rect);
      });
    });
  };
})();
