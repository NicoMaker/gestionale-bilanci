/* Linee del grafico: polilinea, punti, area sensibile al passaggio e segnaposto del tooltip. */
(function () {
  const GB = window.GB;

  GB.chartLines = function (svg, g, lines, labels, attach) {
    const s = GB.svg;
    const { W, H, L, slot, y1, y2 } = g;
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
      // punti con il valore originale (serve per il tooltip)
      const data = [];
      l.values.forEach((v, i) => {
        if (v != null)
          data.push({
            v,
            i,
            x: l.x ? l.x[i] : L + slot * i + slot / 2,
            y: f(v),
          });
      });
      const mark = s("circle", {
        r: 5,
        class: "mark",
        style: { stroke: l.color || "var(--accent)" },
      });
      mark.style.display = "none";
      const nearest = (ev) => {
        const r = svg.getBoundingClientRect();
        const px = ((ev.clientX - r.left) / r.width) * W;
        const py = ((ev.clientY - r.top) / r.height) * H;
        let best = data[0],
          bd = Infinity;
        data.forEach((d) => {
          const dd = Math.abs(d.x - px) + Math.abs(d.y - py) * 0.15;
          if (dd < bd) {
            bd = dd;
            best = d;
          }
        });
        return best;
      };
      const lineInfo = (ev) => {
        const d = nearest(ev);
        mark.setAttribute("cx", d.x);
        mark.setAttribute("cy", d.y);
        return {
          name: l.name,
          label: labels[d.i],
          v: d.v,
          color: l.color,
          y2: l.y2,
          mark,
        };
      };
      const hitLine = s("polyline", {
        points: pts.map((p) => p.join(",")).join(" "),
        fill: "none",
        class: "line-hit",
      });
      attach(hitLine, lineInfo);
      svg.append(hitLine, mark);
      if (data.length === 1) {
        const c = s("circle", {
          cx: data[0].x,
          cy: data[0].y,
          r: 9,
          class: "line-hit-dot",
        });
        attach(c, lineInfo);
        svg.append(c);
      }
    });
  };
})();
