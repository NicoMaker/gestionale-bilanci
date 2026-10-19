/* Mini tabella «Budget» / «Nuovo budget con investimento»: etichetta, importo e % su ricavi. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.investimenti = {};

  GB.parts.investimenti.mini = function (live, I) {
    const mini = (title, rows) => {
      const table = h("table", { class: "fin" });
      table.append(
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h("th", { class: "l" }, title),
            h("th", null, "Importo"),
            h("th", null, "%"),
          ),
        ),
      );
      const tb = h("tbody");
      table.append(tb);
      rows.forEach(([label, vk, pk, cls]) => {
        const a = h("td", { class: "n" }),
          b = h("td", { class: "pc" });
        live.add(a, (e) => GB.setNum(e, I()[vk]));
        live.add(b, (e) => {
          const x = pk ? I()[pk] : null;
          e.textContent = x == null ? "" : fmt.pct(x);
        });
        tb.append(
          h(
            "tr",
            { class: cls || "line" },
            h("td", { class: "l" }, label),
            a,
            b,
          ),
        );
      });
      return h("div", { class: "tbl-wrap free" }, table);
    };
    return mini;
  };
})();
