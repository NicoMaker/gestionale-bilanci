/* Stampa: adattamento delle tabelle alla pagina A4 e intestazione di stampa. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  /* In stampa (A4 orizzontale) una tabella con molti anni non entra: si riduce con zoom in proporzione.
     fixed = larghezza stimata delle colonne fisse (px), perYear = larghezza stimata di ogni anno. */
  GB.printFit = (table, fixed, perYear, n) => {
    const scale = Math.min(1, 1020 / (fixed + perYear * n));
    table.style.setProperty("--pz", scale.toFixed(3));
  };

  GB.printHead = (title, sub) => {
    const S = GB.store;
    return h(
      "div",
      { class: "print-head" },
      h("div", { class: "t" }, title),
      h(
        "div",
        { class: "s" },
        h(
          "div",
          null,
          S.cliente
            ? S.cliente.ragione_sociale +
                (S.cliente.partita_iva
                  ? " — P.IVA " + S.cliente.partita_iva
                  : "")
            : "",
        ),
        h("div", null, sub || ""),
        h("div", null, "Stampato il " + new Date().toLocaleDateString("it-IT")),
      ),
    );
  };
})();
