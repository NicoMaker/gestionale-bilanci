/* Grafici SVG minimali (barre + linee), tema-aware e stampabili. Assembla assi, barre, linee, tooltip e legenda. */
(function () {
  const GB = window.GB;

  /* chart({labels, bars:[{name,values,color}], lines:[{name,values,color,dash,y2}], fmt, fmt2, height}) */
  GB.chart = function ({
    labels,
    bars = [],
    lines = [],
    fmt = GB.fmt.short,
    fmt2 = (v) => v + "%",
    actions = null, // (etichetta) → [{label, fn, danger}]: azioni mostrate cliccando una barra
    tipFmt = null, // formato del valore nel tooltip (default: numero intero o 2 decimali)
    height = 260,
    width = 680,
  }) {
    const s = GB.svg,
      niceScale = GB.niceScale;
    const W = width,
      H = height,
      L = 58,
      R = lines.some((l) => l.y2) ? 46 : 14,
      T = 12,
      B = 30;
    const iw = W - L - R,
      ih = H - T - B;
    const prim = [...bars, ...lines.filter((l) => !l.y2)]
      .flatMap((x) => x.values)
      .filter((v) => v != null && isFinite(v));
    const sec = lines
      .filter((l) => l.y2)
      .flatMap((x) => x.values)
      .filter((v) => v != null && isFinite(v));
    const sc1 = niceScale(Math.min(0, ...prim, 0), Math.max(0, ...prim, 1));
    const sc2 = sec.length
      ? niceScale(Math.min(0, ...sec), Math.max(...sec, 1))
      : null;
    const y1 = (v) => T + ih - ((v - sc1.lo) / (sc1.hi - sc1.lo)) * ih;
    const y2 = (v) => T + ih - ((v - sc2.lo) / (sc2.hi - sc2.lo)) * ih;
    const n = labels.length;
    const slot = iw / n;
    const svg = s("svg", {
      viewBox: `0 0 ${W} ${H}`,
      class: "chart",
      role: "img",
    });

    const { box, tip, attach } = GB.chartTooltip({
      svg,
      fmt2,
      tipFmt,
      actions,
    });
    const g = { W, H, L, R, T, B, iw, ih, slot, y1, y2, sc1, sc2, labels };

    GB.chartAxes(svg, g, fmt, fmt2);
    GB.chartBars(svg, g, bars, labels, attach);
    GB.chartLines(svg, g, lines, labels, attach);
    GB.chartZero(svg, g);
    box.append(svg, tip, GB.chartLegend(bars, lines));
    return box;
  };
})();
