/* Riepilogo cliente: anagrafica, KPI, avvisi di quadratura, andamento di tutti gli esercizi e grafici. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.pages.dashboard = {
    title: "Riepilogo cliente",
    icon: "📊",
    render(container) {
      const S = GB.store;
      const PT = GB.parts.dashboard;
      const Y = S.anno;
      const rows = window.Calc.riepilogo(S.ds);

      const kpis = PT.kpi(S, Y);
      const alerts = PT.avvisi(rows);
      const table = PT.tabella(S, Y, rows);
      const charts = PT.grafici(rows);

      container.append(
        GB.printHead("Riepilogo cliente", "Esercizio di riferimento " + Y),
        PT.schedaCliente(S),
        ...alerts,
        kpis,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Andamento di tutti gli esercizi"),
            h(
              "span",
              { class: "small muted no-print" },
              "clicca una riga per aprire l'esercizio",
            ),
          ),
          h(
            "div",
            {
              class: "tbl-wrap free",
              style: { margin: 0, border: "none", borderRadius: 0 },
            },
            table,
          ),
        ),
        charts,
      );
      return { update() {} };
    },
  };
})();
