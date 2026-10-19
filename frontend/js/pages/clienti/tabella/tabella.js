/* Struttura della tabella clienti: intestazione e corpo. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.tabella = function () {
    const table = h("table", { class: "fin" });
    table.append(
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h("th", { class: "l" }, "Ragione sociale"),
          h("th", { class: "l" }, "P.IVA"),
          h("th", null, "Anno base"),
          h("th", { class: "l" }, "Esercizi"),
          h("th", { class: "l" }, "Creato il"),
          h("th", { class: "no-print" }, ""),
        ),
      ),
    );
    const tb = h("tbody");
    table.append(tb);
    return { table, tb };
  };
})();
