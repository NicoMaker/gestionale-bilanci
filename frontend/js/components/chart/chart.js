/* Grafici SVG minimali (barre + linee), tema-aware e stampabili. */
(function () {
  const GB = window.GB;
  const NS = "http://www.w3.org/2000/svg";
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else el.setAttribute(k, v);
    }
    for (const c of kids.flat())
      if (c != null)
        el.append(typeof c === "string" ? document.createTextNode(c) : c);
    return el;
  }
  function niceScale(min, max, ticks = 4) {
    if (min === max) {
      max = min + 1;
    }
    const range = max - min;
    const rough = range / ticks;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step,
      hi = Math.ceil(max / step) * step;
    const vals = [];
    for (let v = lo; v <= hi + step / 2; v += step)
      vals.push(Math.round(v / step) * step);
    return { lo, hi, vals };
  }

  /* chart({labels, bars:[{name,values,color}], lines:[{name,values,color,dash,y2}], fmt, fmt2, height}) */
  GB.chart = function ({
    labels,
    bars = [],
    lines = [],
    fmt = GB.fmt.short,
    fmt2 = (v) => v + "%",
    height = 260,
    width = 680,
  }) {
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
    const bw = Math.min(46, (slot * 0.7) / Math.max(1, bars.length));
    bars.forEach((b, bi) => {
      b.values.forEach((v, i) => {
        if (v == null) return;
        const x = L + slot * i + slot / 2 - (bw * bars.length) / 2 + bw * bi;
        const yy = y1(Math.max(v, 0)),
          y0 = y1(Math.min(v, 0));
        svg.append(
          s(
            "rect",
            {
              x,
              y: yy,
              width: bw - 2,
              height: Math.max(1, y0 - yy),
              rx: 2,
              style: { fill: b.color || "var(--accent)" },
            },
            s("title", {}, `${b.name} ${labels[i]}: ${GB.fmt.num(v, 0)}`),
          ),
        );
      });
    });
    lines.forEach((l) => {
      const f = l.y2 ? y2 : y1;
      const pts = l.values
        .map((v, i) =>
          v == null ? null : [l.x ? l.x[i] : L + slot * i + slot / 2, f(v)],
        )
        .filter(Boolean);
      if (!pts.length) return;
      svg.append(
        s("polyline", {
          points: pts.map((p) => p.join(",")).join(" "),
          fill: "none",
          "stroke-width": l.width || 2.2,
          "stroke-linejoin": "round",
          "stroke-dasharray": l.dash || "",
          style: { stroke: l.color || "var(--accent)" },
        }),
      );
      if (!l.nodots)
        pts.forEach((p) =>
          svg.append(
            s("circle", {
              cx: p[0],
              cy: p[1],
              r: 2.6,
              style: { fill: l.color || "var(--accent)" },
            }),
          ),
        );
    });
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
    const legend = GB.h(
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
    return GB.h("div", null, svg, legend);
  };
})();
