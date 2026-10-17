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
    tipFmt = null, // formato del valore nel tooltip (default: numero intero o 2 decimali)
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

    /* ── tooltip: compare solo sull'elemento toccato (barra, punto o linea);
       sullo spazio vuoto non si vede nulla. Mouse: passaggio + clic per fissarlo; touch: tocco. ── */
    const tip = GB.h("div", { class: "chart-tip", role: "status" });
    const box = GB.h("div", { class: "chart-box" });
    let pinned = null; // elemento fissato con il clic
    let marked = null; // elemento evidenziato
    const valueText = (v, isY2) =>
      tipFmt
        ? tipFmt(v)
        : isY2
          ? fmt2(Math.round(v * 100) / 100)
          : GB.fmt.num(v, Math.abs(v) >= 1000 ? 0 : 2);
    const setMark = (el, on) => {
      el.classList.toggle("sel", on);
      if (el.classList.contains("mark")) el.style.display = on ? "" : "none";
    };
    const unmark = () => {
      if (marked) setMark(marked, false);
      marked = null;
    };
    const hideTip = () => {
      tip.classList.remove("on");
      unmark();
    };
    const place = (ev) => {
      const b = box.getBoundingClientRect();
      let x = ev.clientX - b.left + 14,
        y = ev.clientY - b.top - 14 - tip.offsetHeight;
      if (x + tip.offsetWidth > b.width)
        x = ev.clientX - b.left - tip.offsetWidth - 14;
      if (x < 0) x = 4;
      if (y < 0) y = ev.clientY - b.top + 16;
      tip.style.left = x + "px";
      tip.style.top = y + "px";
    };
    const showTip = (info, ev, markEl) => {
      const cls = info.v > 0 ? " pos" : info.v < 0 ? " neg" : "";
      tip.replaceChildren(
        GB.h("div", { class: "t" }, String(info.label)),
        GB.h(
          "div",
          { class: "r" },
          GB.h("i", { style: { background: info.color || "var(--accent)" } }),
          GB.h("span", null, info.name),
          GB.h("b", { class: "v" + cls }, valueText(info.v, info.y2)),
        ),
      );
      tip.classList.add("on");
      unmark();
      if (markEl) {
        setMark(markEl, true);
        marked = markEl;
      }
      place(ev);
    };
    // collega un elemento del grafico: info(ev) → { name, label, v, color, y2, mark? }
    const attach = (el, info) => {
      el.classList.add("hit");
      el.addEventListener("pointerenter", (ev) => {
        if (ev.pointerType === "mouse" && !pinned) {
          const i = info(ev);
          showTip(i, ev, i.mark || el);
        }
      });
      el.addEventListener("pointermove", (ev) => {
        if (ev.pointerType !== "mouse" || pinned) return;
        const i = info(ev);
        showTip(i, ev, i.mark || el);
      });
      el.addEventListener("pointerleave", (ev) => {
        if (ev.pointerType === "mouse" && !pinned) hideTip();
      });
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const i = info(ev);
        pinned = true;
        showTip(i, ev, i.mark || el);
      });
    };
    // clic sullo sfondo: il tooltip sparisce
    svg.addEventListener("click", () => {
      pinned = null;
      hideTip();
    });
    document.addEventListener("keydown", function esc(e) {
      if (!box.isConnected) return document.removeEventListener("keydown", esc);
      if (e.key === "Escape") {
        pinned = null;
        hideTip();
      }
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
    box.append(svg, tip, legend);
    return box;
  };
})();
