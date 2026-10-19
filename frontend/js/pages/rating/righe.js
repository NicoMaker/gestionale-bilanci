/* Tipi di riga della tabella rating: titolo, riga importo+%, riga indicatore+scoring. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.rating.righe = function ({ years, live, R, tb }) {
    const title = (t, c1, c2) => {
      const tr = h("tr", { class: "title" }, h("td", { class: "stk0" }, t));
      years.forEach(() =>
        tr.append(
          h("td"),
          h("td", { style: { textAlign: "right" } }, c1 || ""),
          h("td", { style: { textAlign: "right" } }, c2 || ""),
        ),
      );
      tb.append(tr);
    };
    const line = (label, valFn, pctFn, cls) => {
      const tr = h(
        "tr",
        { class: cls || "line" },
        h("td", { class: "l stk0" }, label),
      );
      years.forEach((a) => {
        const v = h("td", { class: "n" }),
          p = h("td", { class: "pc" });
        tr.append(h("td", { class: "gap" }), v, p);
        live.add(v, (e) => GB.setNum(e, valFn(R(a))));
        live.add(p, (e) => {
          const x = pctFn ? pctFn(R(a)) : null;
          e.textContent = x == null ? "" : fmt.pct(x);
        });
      });
      tb.append(tr);
    };
    const ind = (label, key, sKey, f) => {
      const tr = h(
        "tr",
        { class: "line" },
        h("td", { class: "l stk0" }, label),
      );
      years.forEach((a) => {
        const v = h("td", { class: "n" }),
          s = h("td", { class: "n", style: { fontWeight: 700 } });
        tr.append(h("td", { class: "gap" }), v, s);
        live.add(v, (e) => {
          const x = R(a)[key];
          e.textContent = x == null ? "n.d." : f(x);
        });
        live.add(s, (e) => {
          e.textContent = R(a)[sKey];
        });
      });
      tb.append(tr);
    };
    return { title, line, ind };
  };
})();
