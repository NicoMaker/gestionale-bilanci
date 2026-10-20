/* Struttura della tabella clienti: intestazione e corpo. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.tabella = function () {
    const table = h("table", { class: "fin clienti-tab" });
    // casella «seleziona tutti» (righe visibili, cioè quelle filtrate dalla ricerca)
    const chkAll = h("input", {
      type: "checkbox",
      class: "sel-chk",
      title: "Seleziona / deseleziona tutti i clienti visibili",
      "aria-label": "Seleziona tutti i clienti visibili",
    });
    table.append(
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h("th", { class: "sel-col no-print" }, chkAll),
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
    return { table, tb, chkAll };
  };
})();
