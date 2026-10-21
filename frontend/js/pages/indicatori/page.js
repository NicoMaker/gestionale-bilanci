/* Indicatori di performance: EBITDA-MOL, ROE, ROI, ROS, margine di tesoreria, current ratio, rotazione magazzino. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.pages.indicatori = {
    title: "Indicatori di performance",
    icon: "📐",
    render(container) {
      const S = GB.store;
      const years = [...S.R.tutti].reverse(); // tutti gli esercizi in colonna (si scorre in orizzontale)
      const live = GB.live();
      const table = GB.parts.indicatori.tabella(years, live);
      const grafico = GB.parts.indicatori.grafico([...years].reverse());
      container.append(
        GB.printHead(
          "Indicatori di performance",
          "Esercizi " + years.join(" · "),
        ),
        h("div", { class: "tbl-wrap free" }, table),
        grafico.card,
      );
      return {
        update: () => {
          live.update();
          grafico.draw();
        },
      };
    },
  };
})();
