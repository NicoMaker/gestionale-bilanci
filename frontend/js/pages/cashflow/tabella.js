/* Struttura della tabella cash flow: intestazione (12 mesi + totale) e riga titolo di gruppo. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.cashflow = {};

  GB.parts.cashflow.tabella = function (Y) {
    const table = h("table", { class: "fin" });
    table.append(
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h(
            "th",
            { class: "l", style: { minWidth: "260px" } },
            "CASH FLOW " + (Y + 1),
          ),
          T.MESI.map((m) => h("th", null, m.slice(0, 3).toUpperCase())),
          h("th", null, "TOTALE"),
          h("th", { class: "no-ro" }),
        ),
      ),
    );
    const tb = h("tbody");
    table.append(tb);
    const span = 15;
    const title = (t) =>
      tb.append(h("tr", { class: "title" }, h("td", { colspan: span }, t)));
    return { table, tb, span, title };
  };
})();
