/* Tabellina «cosa si perde» prima di eliminare un anno o un cliente. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  // Tabellina "cosa si perde": d = {anni:[{anno,valori,vendite,cashflow,budget_var,parametri,totale}]} oppure un singolo anno
  GB.riepilogoDati = function (d) {
    const anni = d.anni || [d];
    const th = (t) =>
      h(
        "th",
        { style: { textAlign: "right", padding: "4px 8px", fontSize: "11px" } },
        t,
      );
    return h(
      "div",
      {
        class: "tbl-wrap free",
        style: { margin: "10px 0", maxHeight: "220px" },
      },
      h(
        "table",
        { class: "fin" },
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h("th", { class: "l" }, "Anno"),
            th("Bilancio"),
            th("Vendite"),
            th("Cash flow"),
            th("Var. budget"),
            th("Parametri"),
          ),
        ),
        h(
          "tbody",
          null,
          [...anni]
            .reverse()
            .filter((a) => a.totale)
            .map((a) =>
              h(
                "tr",
                { class: "line" },
                h("td", { class: "l" }, String(a.anno)),
                [
                  a.valori,
                  a.vendite,
                  a.cashflow,
                  a.budget_var,
                  a.parametri,
                ].map((x) => h("td", { class: "n" }, x ? String(x) : "–")),
              ),
            ),
        ),
      ),
    );
  };
})();
