/* Copertina del report: ragione sociale, P.IVA, esercizi, data di stampa. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.report.copertina = function (S) {
    return h(
      "div",
      { class: "card" },
      h(
        "div",
        {
          class: "card-b",
          style: { textAlign: "center", padding: "46px 20px" },
        },
        h("div", { class: "small muted" }, "ANALISI DI BILANCIO"),
        h(
          "div",
          {
            style: {
              fontFamily: "var(--serif)",
              fontSize: "34px",
              fontWeight: 600,
              margin: "8px 0",
            },
          },
          S.cliente.ragione_sociale,
        ),
        S.cliente.partita_iva
          ? h("div", null, "P.IVA " + S.cliente.partita_iva)
          : null,
        h(
          "div",
          { style: { marginTop: "10px" } },
          `Esercizi ${S.R.tutti.join(" · ")} — Budget ${S.anno + 1}`,
        ),
        h(
          "div",
          { class: "small muted", style: { marginTop: "6px" } },
          "Stampato il " + new Date().toLocaleDateString("it-IT"),
        ),
      ),
    );
  };
})();
