/* Rating: indicatori creditizi, scoring 1-3 per indicatore e classe complessiva AAA…CCC per ogni esercizio. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.pages.rating = {
    title: "Rating (indicatori creditizi)",
    icon: "🎯",
    render(container) {
      const S = GB.store;
      const P = GB.parts.rating;
      const years = [...S.R.tutti].reverse(); // tutti gli esercizi in colonna (si scorre in orizzontale)
      container.classList.add("fit");
      const live = GB.live();
      const R = (a) => S.R.anni[a].rating;
      const { table, tb, span } = P.tabella(years);
      P.sezioni({ years, tb, span }, P.righe({ years, live, R, tb }));
      P.punteggio({ years, live, R, tb });
      container.append(
        GB.printHead(
          "Rating — indicatori creditizi",
          "Esercizi " + years.join(" · "),
        ),
        P.legenda(),
        h("div", { class: "tbl-wrap free" }, table),
      );
      return { update: () => live.update() };
    },
  };
})();
