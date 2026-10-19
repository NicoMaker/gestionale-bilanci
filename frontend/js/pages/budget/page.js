/* Budget: previsione dell'anno successivo con inflazione, produttività e variazioni manuali per riga. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.pages.budget = {
    title: "Budget",
    icon: "🗓️",
    render(container, ro) {
      const S = GB.store;
      const PT = GB.parts.budget;
      const Y = S.anno;
      const live = GB.live();
      const B = () => S.R.bud;

      const { P, legend } = PT.parametri({ ro, Y });
      const { table, tb, span } = PT.tabella(Y);
      const pctCells = PT.pctCells({ live, B });
      const { totalRow, R } = PT.righeTotale({ tb, span, live, B, pctCells });
      const sectionBlock = PT.bloccoSezione(
        { tb, span, ro, Y, live, B, pctCells },
        totalRow,
      );
      PT.contoEconomico(
        { tb, span, ro, Y, live, B, P },
        { sectionBlock, totalRow, R },
      );
      GB.gridNav(table);
      const conf = PT.confronto();

      container.append(
        GB.printHead(`Budget ${Y + 1}`, `Base consolidata: esercizio ${Y}`),
        legend,
        h("div", { class: "tbl-wrap free" + (ro ? " ro" : "") }, table),
        conf.multi.el,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Consolidato e budget per esercizio"),
          ),
          conf.mChart,
        ),
      );
      return {
        update: () => {
          live.update();
          conf.multi.update();
          conf.drawMulti();
        },
      };
    },
  };
})();
