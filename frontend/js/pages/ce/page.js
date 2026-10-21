/* Conto Economico: tabella riclassificata a più anni con totali, margini e analisi del punto di pareggio. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.pages.ce = {
    title: "Conto Economico",
    icon: "📈",
    render(container, ro) {
      const S = GB.store;
      const years = [...S.R.tutti].reverse(); // tutti gli esercizi in colonna (si scorre in orizzontale)
      container.classList.add("fit");
      const tbl = GB.fin.build(
        {
          ambito: "CE",
          years,
          layout: GB.parts.ce.layout(),
          getY: (a) => S.R.anni[a].ce,
          den: (a) => S.R.anni[a].ce.ricavi,
        },
        ro,
      );
      container.append(
        GB.printHead(
          "Conto Economico riclassificato",
          "Esercizi " + years.join(" · "),
        ),
        GB.parts.ce.notaTipi(),
        ro
          ? ""
          : h(
              "div",
              { class: "no-print", style: { marginBottom: "12px" } },
              GB.addAnnoBtn(),
            ),
        tbl.el,
      );
      return { update: tbl.update };
    },
  };
})();
