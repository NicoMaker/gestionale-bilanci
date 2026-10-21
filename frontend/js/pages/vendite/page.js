/* Vendite: ricavi mensili degli ultimi esercizi, fattore medio ponderato, stagionalità e progressiva. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.pages.vendite = {
    title: "Vendite — stagionalità",
    icon: "🛒",
    render(container, ro) {
      const S = GB.store;
      const P = GB.parts.vendite;
      const years = [...S.R.years].reverse(); // dal più recente al più vecchio
      const live = GB.live();
      const V = () => S.R.vend;
      const table = P.tabella({ years, ro, live, V });
      const grafico = P.grafico(V);
      const conf = P.confronto();

      container.append(
        GB.printHead("Vendite — stagionalità", "Esercizi " + years.join(" · ")),
        h(
          "div",
          { class: "note no-print" },
          "Inserisci i ricavi mensili degli ultimi tre esercizi. Il fattore medio è la media ponderata con i pesi indicati; la stagionalità (%) distribuisce il fatturato annuo sui mesi ed è usata per costruire il grafico del punto di pareggio.",
        ),
        h("div", { class: "tbl-wrap free" + (ro ? " ro" : "") }, table),
        h(
          "div",
          { class: "card" },
          h("div", { class: "card-h" }, h("h3", null, "Andamento stagionale")),
          grafico.box,
        ),
        conf.multi.el,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Vendite mensili a confronto tra gli esercizi"),
          ),
          conf.mChart,
        ),
      );
      return {
        update: () => {
          live.update();
          grafico.draw();
          conf.multi.update();
          conf.drawMulti();
        },
      };
    },
  };
})();
