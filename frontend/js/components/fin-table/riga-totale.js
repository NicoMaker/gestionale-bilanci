/* Riga di totale (sezione, margine, EBITDA, utile…) con valori e percentuali calcolati. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.finRows = GB.finRows || {};

  GB.finRows.totale = function (label, key, cls, cfg, live, years, ce, item) {
    const tr = h(
      "tr",
      { class: cls },
      h("td", { class: "stk1" }),
      h("td", { class: "l stk2" }, label),
    );
    if (ce) tr.append(h("td"));
    years.forEach((a) => {
      const c = h("td", { class: "n" });
      const p = h("td", { class: "pc" });
      tr.append(h("td", { class: "gap" }), c, p);
      const getter = (yy) => {
        const o = cfg.getY(yy);
        if (item.sez) return o.sez ? o.sez[key] : o[key];
        return o[key];
      };
      live.add(c, (e) => {
        const v = getter(a);
        if (item.fmt === "pt") e.textContent = fmt.pt(v);
        else if (item.fmt === "pct100")
          e.textContent = fmt.pt(v) + (v == null ? "" : " %");
        else if (item.fmt === "pctfrac")
          e.textContent = v == null ? "" : fmt.pct(v);
        else if (item.fmt === "int") e.textContent = fmt.num(v, 2);
        else if (item.fmt === "date") {
          const d = window.Calc.dayLabel(v);
          e.textContent = d
            ? d.oltre
              ? "oltre il 31 dic"
              : d.giornoMese +
                " " +
                window.Template.MESI[d.mese].slice(0, 3).toLowerCase()
            : "";
        } else GB.setNum(e, v);
      });
      live.add(p, (e) => {
        if (item.nopct) {
          e.textContent = "";
          return;
        }
        const d = cfg.den(a, item),
          v = getter(a);
        e.textContent = d && v ? fmt.pt((v / d) * 100) : "";
      });
    });
    tr.append(h("td", { class: "no-ro" }));
    return tr;
  };
})();
