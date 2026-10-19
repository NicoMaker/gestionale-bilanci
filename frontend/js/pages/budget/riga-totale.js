/* Righe di totale del budget (consolidato + previsione, con % e differenza) e scorciatoia R() per le chiavi del calcolo. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.budget.righeTotale = function ({ tb, span, live, B, pctCells }) {
    const totalRow = (label, cls, getC, getH, opts = {}) => {
      const tr = h(
        "tr",
        { class: cls },
        h("td", { class: "l" }, label),
        h("td"),
      );
      const c = h("td", { class: "n" }),
        hh = h("td", { class: "n" });
      const fmtFn = (e, v) => {
        if (opts.fmt === "pct100")
          e.textContent = v == null ? "" : fmt.pt(v) + " %";
        else if (opts.fmt === "int") e.textContent = fmt.num(v, 2);
        else if (opts.fmt === "date") {
          const d = window.Calc.dayLabel(v);
          e.textContent = d
            ? d.oltre
              ? "oltre il 31 dic"
              : d.giornoMese + " " + T.MESI[d.mese].slice(0, 3).toLowerCase()
            : "";
        } else GB.setNum(e, v);
      };
      live.add(c, (e) => fmtFn(e, getC()));
      live.add(hh, (e) => fmtFn(e, getH()));
      const pc = pctCells(tr, getC, getH);
      if (opts.nopct)
        tr.append(
          c,
          h("td", { class: "pc" }),
          h("td"),
          h("td"),
          hh,
          h("td", { class: "pc" }),
          h("td", { class: "pc" }),
          h("td", { class: "no-ro" }),
        );
      else {
        pc.bind();
        tr.append(
          c,
          pc.d,
          h("td"),
          h("td"),
          hh,
          pc.i,
          pc.j,
          h("td", { class: "no-ro" }),
        );
      }
      tb.append(tr);
    };
    const R = (label, key, cls, opts) =>
      totalRow(
        label,
        cls || "big",
        () => B().C[key],
        () => B().H[key],
        opts,
      );
    return { totalRow, R };
  };
})();
