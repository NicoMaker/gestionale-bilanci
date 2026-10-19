/* Tabella mensile del BEP: vendite cumulate, costi fissi, costi totali, fatturato minimo. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.bep.tabella = function () {
    const table = h("table", { class: "fin" });
    table.append(
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h("th", { class: "l" }, ""),
          [
            "Vendite (cumulate)",
            "Costi fissi",
            "Costi totali",
            "BEP (fatturato minimo)",
          ].map((x) => h("th", null, x)),
        ),
      ),
    );
    const tb = h("tbody");
    table.append(tb);
    return { table, tb };
  };

  GB.parts.bep.riempiTabella = function (tb, P) {
    tb.replaceChildren(
      ...P.rows.map((r) =>
        h(
          "tr",
          { class: "line" },
          h("td", { class: "l" }, r.label),
          h("td", { class: "n" }, fmt.num(r.vendite)),
          h("td", { class: "n" }, fmt.num(r.fissi)),
          h("td", { class: "n" }, fmt.num(r.totali)),
          h("td", { class: "n" }, fmt.num(r.bep)),
        ),
      ),
    );
  };
})();
