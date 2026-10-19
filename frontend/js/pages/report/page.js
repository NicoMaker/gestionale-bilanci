/* Report completo: copertina + tutte le pagine del cliente in sequenza, pronte per la stampa. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.pages.report = {
    title: "Report completo",
    icon: "🖨️",
    render(container) {
      const S = GB.store;
      const ups = [];
      container.append(
        h(
          "div",
          { class: "note no-print" },
          "Anteprima di tutte le pagine del cliente in sequenza, pronta per la stampa (una pagina del bilancio per foglio). Premi «Stampa» in alto per stampare o salvare in PDF.",
        ),
        GB.parts.report.copertina(S),
      );
      GB.parts.report.ORDER.forEach((k) =>
        GB.parts.report.sezione(container, k, ups),
      );
      return { update: () => ups.forEach((f) => f()) };
    },
  };
})();
