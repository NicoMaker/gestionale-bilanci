/* Tabella degli indicatori: una riga per indicatore, una colonna per esercizio (valori aggiornati dal motore live). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.indicatori.tabella = function (years, live) {
    const S = GB.store;
    const DEFS = GB.parts.indicatori.DEFS;
    const table = h("table", { class: "fin" });
    GB.printFit(table, 480, 70, years.length);
    table.append(
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h("th", { class: "l stk0" }, "Indicatore"),
          h("th", { class: "l" }, "Formula"),
          years.map((a) => h("th", null, String(a))),
        ),
      ),
    );
    const tb = h("tbody");
    table.append(tb);
    DEFS.forEach((d) => {
      const tr = h(
        "tr",
        { class: "line" },
        h("td", { class: "l stk0", style: { fontWeight: 700 } }, d.l),
        h("td", { class: "l muted small" }, d.f),
      );
      years.forEach((a) => {
        const c = h("td", { class: "n", style: { fontSize: "13.5px" } });
        tr.append(c);
        live.add(c, (e) => {
          const v = S.R.anni[a].ind[d.k];
          e.textContent =
            v == null
              ? "n.d."
              : d.t === "pct"
                ? fmt.pct(v)
                : d.t === "eur"
                  ? fmt.num(v)
                  : fmt.num(v, 2);
          e.classList.toggle("neg", v != null && v < 0);
        });
      });
      tb.append(tr);
    });
    return table;
  };
})();
