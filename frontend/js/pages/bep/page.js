/* Punto di pareggio (BEP): fatturato minimo, data di pareggio, diagramma mensile e confronto tra esercizi. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.pages.bep = {
    title: "Punto di pareggio (BEP)",
    icon: "⚖️",
    render(container) {
      const S = GB.store;
      const PT = GB.parts.bep;
      const Y = S.anno;
      const kpis = h("div", { class: "kpis" });
      const chartBox = h("div", { class: "card-b" });
      const { table, tb } = PT.tabella();

      const draw = () => {
        PT.kpi(kpis, Y);
        PT.grafico(chartBox, S.R.bep);
        PT.riempiTabella(tb, S.R.bep);
      };
      const conf = PT.confronto();

      draw();
      container.append(
        GB.printHead(
          `Punto di pareggio — budget ${Y + 1}`,
          `Base: esercizio ${Y}`,
        ),
        h(
          "div",
          { class: "note no-print" },
          "Le vendite mensili cumulate sono il fatturato di budget distribuito con la progressiva di stagionalità (pagina Vendite). I costi totali = vendite × (costo materie prime + spese variabili)/ricavi + spese fisse. Il punto di pareggio è dove le vendite superano i costi totali.",
        ),
        kpis,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Diagramma del punto di pareggio"),
          ),
          chartBox,
        ),
        h("div", { class: "tbl-wrap free" }, table),
        conf.multi.el,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h(
              "h3",
              null,
              "Fatturato di budget e punto di pareggio per esercizio",
            ),
          ),
          conf.mChart,
        ),
      );
      return {
        update: () => {
          draw();
          conf.multi.update();
          conf.drawMulti();
        },
      };
    },
  };
})();
