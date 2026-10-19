/* Struttura della tabella rating: intestazione con una colonna (importo, %) per anno. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.rating = {};

  GB.parts.rating.tabella = function (years) {
    const table = h("table", { class: "fin" });
    GB.printFit(table, 220, 150, years.length);
    const head = h(
      "tr",
      null,
      h("th", { class: "l stk0" }, "Indicatori creditizi"),
    );
    years.forEach((a) =>
      head.append(
        h("th", { class: "gap" }),
        h("th", null, String(a)),
        h("th", null, "%"),
      ),
    );
    table.append(h("thead", null, head));
    const tb = h("tbody");
    table.append(tb);
    const span = 1 + years.length * 3;
    return { table, tb, span };
  };
})();
