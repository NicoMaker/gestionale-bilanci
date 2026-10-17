(function () {
  const GB = window.GB;
  const { h } = GB;
  const ORDER = [
    "dashboard",
    "sp",
    "ce",
    "rating",
    "indicatori",
    "vendite",
    "budget",
    "bep",
    "investimenti",
    "cashflow",
  ];

  GB.pages.report = {
    title: "Report completo",
    icon: "🖨️",
    render(container) {
      const S = GB.store;
      const ups = [];
      container.append(
        h(
          "div",
          { class: "note no-print" },
          "Anteprima di tutte le pagine del cliente in sequenza, pronta per la stampa (una pagina del bilancio per foglio). Premi «Stampa» in alto per stampare o salvare in PDF.",
        ),
        h(
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
        ),
      );
      ORDER.forEach((k) => {
        const p = GB.pages[k];
        const sec = h(
          "section",
          { class: "report-sec" },
          h(
            "h2",
            {
              class: "no-print",
              style: { fontFamily: "var(--serif)", margin: "26px 0 12px" },
            },
            p.icon + " " + p.title,
          ),
        );
        container.append(sec);
        const r = p.render(sec, true);
        if (r && r.update) ups.push(r.update);
      });
      return { update: () => ups.forEach((f) => f()) };
    },
  };
})();
