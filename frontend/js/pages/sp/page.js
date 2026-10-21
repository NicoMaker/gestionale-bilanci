/* Stato Patrimoniale: tabella riclassificata a più anni con totali e verifica di quadratura. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.pages.sp = {
    title: "Stato Patrimoniale",
    icon: "🏛️",
    render(container, ro) {
      const S = GB.store;
      const years = [...S.R.tutti].reverse(); // tutti gli esercizi in colonna (si scorre in orizzontale)
      container.classList.add("fit");
      const tbl = GB.fin.build(
        {
          ambito: "SP",
          years,
          layout: GB.parts.sp.layout(),
          getY: (a) => S.R.anni[a].sp,
          den: (a, item) =>
            item.side === "A"
              ? S.R.anni[a].sp.totale_attivo
              : S.R.anni[a].sp.totale_passivita,
        },
        ro,
      );
      const allinea = () => GB.parts.sp.allinea(years);
      container.append(
        GB.printHead(
          "Stato Patrimoniale riclassificato",
          "Esercizi " + years.join(" · "),
        ),
        h(
          "div",
          { class: "note no-print" },
          "Inserisci gli importi per ciascun esercizio: scorri a destra per vedere tutti gli anni (codice e descrizione restano fissi). I fondi ammortamento vanno inseriti con segno negativo. I totali, le percentuali e il Check = 0 si aggiornano automaticamente.",
        ),
        ro
          ? ""
          : h(
              "div",
              {
                class: "no-print",
                style: {
                  marginBottom: "12px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                },
              },
              h(
                "button",
                { class: "btn sm", onclick: allinea },
                "↤ Allinea “Risultato d'esercizio” all'utile del C.E.",
              ),
              GB.addAnnoBtn(),
            ),
        tbl.el,
      );
      return { update: tbl.update };
    },
  };
})();
