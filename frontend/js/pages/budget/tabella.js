/* Struttura della tabella budget: intestazione (consolidato, ripartizione, variazioni manuali, previsione) e corpo. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.budget.tabella = function (Y) {
    const table = h("table", { class: "fin" });
    table.append(
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h("th", { class: "l" }, "Ricavi e Costi"),
          h("th", null, "Tipo"),
          h("th", null, "Consolidato " + Y),
          h("th", null, "%"),
          h("th", null, "Ripartiz."),
          h("th", null, "Variaz. manuali"),
          h("th", null, "Previsione " + (Y + 1)),
          h("th", null, "%"),
          h("th", null, "Diff. % su cons."),
        ),
      ),
    );
    const tb = h("tbody");
    table.append(tb);
    const span = 9;
    return { table, tb, span };
  };
})();
