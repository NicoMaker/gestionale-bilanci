/* Tabella «Andamento di tutti gli esercizi»: ricavi, margini, indici, rating, quadratura S.P. e budget (clic sulla riga per aprirlo). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.dashboard.tabella = function (S, Y, rows) {
    const table = h("table", { class: "fin" });
    table.append(
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          [
            "Esercizio",
            "Ricavi",
            "EBITDA",
            "EBIT",
            "Utile",
            "Totale attivo",
            "Patrimonio netto",
            "ROE",
            "ROS",
            "Current ratio",
            "Rating",
            "S.P.",
            "Budget anno succ.: ricavi",
            "Budget: utile",
            "Budget: BEP",
          ].map((t, i) => h("th", { class: i === 0 ? "l" : "" }, t)),
        ),
      ),
    );
    const tb = h("tbody");
    table.append(tb);
    [...rows].reverse().forEach((r) => {
      const m = S.M.find((x) => x.anno === r.anno);
      const tr = h(
        "tr",
        {
          class: "line",
          style: { cursor: "pointer", fontWeight: r.anno === Y ? 700 : 400 },
          title: "Apri questo esercizio",
          onclick: () => S.setYear(r.anno),
        },
        h("td", { class: "l" }, String(r.anno) + (r.anno === Y ? "  ◀" : "")),
        ...[r.ricavi, r.ebitda, r.ebit, r.utile, r.attivo, r.pn].map((v) =>
          h("td", { class: "n" + (v < 0 ? " neg" : "") }, fmt.num(v, 0)),
        ),
        h("td", { class: "n" }, r.roe == null ? "" : fmt.pct(r.roe, 1)),
        h("td", { class: "n" }, r.ros == null ? "" : fmt.pct(r.ros, 1)),
        h(
          "td",
          { class: "n" },
          r.current_ratio == null ? "" : fmt.num(r.current_ratio, 2),
        ),
        h(
          "td",
          { class: "n" },
          r.vuoto
            ? ""
            : h(
                "span",
                {
                  class: "rating " + (r.rating ? "r-" + r.rating : "r-nd"),
                  style: {
                    fontSize: "13px",
                    padding: "1px 8px",
                    minWidth: "40px",
                  },
                },
                r.rating || "n.d.",
              ),
        ),
        h(
          "td",
          { class: "n" },
          r.vuoto
            ? ""
            : Math.abs(r.check) < 0.005
              ? h("span", { class: "pill ok" }, "OK")
              : h("span", { class: "pill ko" }, "≠ 0"),
        ),
        ...(m
          ? [m.bud.H.ricavi, m.bud.H.utile, m.bud.H.bep_fatturato]
          : [null, null, null]
        ).map((v) =>
          h(
            "td",
            { class: "n" + (v < 0 ? " neg" : "") },
            v ? fmt.num(v, 0) : "",
          ),
        ),
      );
      tb.append(tr);
    });
    return table;
  };
})();
