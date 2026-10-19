/* Campo di ricerca con pulsante «✕» e contatore dei risultati. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.barraRicerca = function () {
    const input = h("input", {
      type: "search",
      placeholder: "Cerca cliente per nome, P.IVA o anno…",
      autocomplete: "off",
      spellcheck: "false",
      "aria-label": "Cerca cliente",
      value: GB.clientiQuery || "",
    });
    const clear = h(
      "button",
      {
        type: "button",
        class: "ls-clear",
        title: "Cancella ricerca",
        "aria-label": "Cancella ricerca",
      },
      "✕",
    );
    const wrap = h(
      "div",
      { class: "list-search" },
      h("span", { class: "ls-ico", "aria-hidden": "true" }, "🔍"),
      input,
      clear,
    );
    const count = h("div", { class: "list-count", "aria-live": "polite" });
    const tools = h("div", { class: "list-tools no-print" }, wrap, count);
    return { input, clear, wrap, count, tools };
  };
})();
