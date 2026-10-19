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
      const head = PT.barra({
        nuovo: PT.azioni.nuovo,
        demoClienti: PT.azioni.demoClienti,
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
