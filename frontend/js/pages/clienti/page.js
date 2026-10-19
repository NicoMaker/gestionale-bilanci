/* Clienti: elenco con ricerca, creazione, modifica, eliminazione e caricamento dei clienti demo. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.pages.clienti = {
    title: "Clienti",
    icon: "👥",
    noClient: true,
    render(container) {
      const S = GB.store;
      const PT = GB.parts.clienti;
      // raccolgo anni disponibili tra tutti i clienti per il selettore
      const anniOptions = Array.from(
        new Set([].concat(...S.clienti.map((c) => c.anni || [])))
      ).sort((a, b) => a - b);
      const selectedYear = Number(localStorage.getItem("gb.clienti.year")) || null;
      const head = PT.barra({
        nuovo: PT.azioni.nuovo,
        demoClienti: PT.azioni.demoClienti,
        aggiungiAnno: PT.azioni.aggiungiAnnoATutti,
        aggiungiAnnoSelezionati: PT.azioni.aggiungiAnnoSelezionati,
        eliminaDatiSelezionati: PT.azioni.eliminaDatiSelezionati,
        anniOptions,
        selectedYear,
        onYearChange: (y) => {
          if (y) localStorage.setItem("gb.clienti.year", String(y));
          else localStorage.removeItem("gb.clienti.year");
          GB.clientiYear = y || null;
          // paintRows is defined later in this scope; calling it when the user changes the year
          if (typeof paintRows === "function") paintRows();
        },
      });

      if (!S.clienti.length) {
        container.append(head, PT.vuoto());
        return { update() {} };
      }
      const { table, tb } = PT.tabella();
      const { plain, hay, hl } = PT.ricerca(S);
      const { input, clear, wrap, count, tools } = PT.barraRicerca();
      const paintRows = PT.righe({ S, input, wrap, tb, count, hay, hl, plain });
      PT.eventiRicerca({ input, clear, paintRows });
      paintRows();

      const strip = h("div", { class: "studio-strip no-print" });
      if (GB.parts.studio && GB.parts.studio.carica)
        GB.parts.studio.carica(strip, (st) => GB.parts.studio.kpi(st, true));
      container.append(
        GB.printHead("Elenco clienti", ""),
        head,
        strip,
        tools,
        h("div", { class: "tbl-wrap free" }, table),
      );
      if (GB.clientiQuery) {
        const l = input.value.length;
        input.focus({ preventScroll: true });
        try {
          input.setSelectionRange(l, l);
        } catch (e) {
          /* type=search */
        }
      }
      return { update() {} };
    },
  };
})();
