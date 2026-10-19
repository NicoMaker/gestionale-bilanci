/* Eventi della ricerca: digitazione, Esc per cancellare, Invio per aprire se c'è un solo risultato, «✕». */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.eventiRicerca = function ({ input, clear, paintRows }) {
    const { apri } = GB.parts.clienti.azioni;
    input.addEventListener("input", paintRows);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && input.value) {
        e.preventDefault();
        input.value = "";
        paintRows();
      } else if (e.key === "Enter") {
        const rows = paintRows();
        if (rows.length === 1) apri(rows[0]);
      } // un solo risultato: Invio apre il cliente
    });
    clear.addEventListener("click", () => {
      input.value = "";
      paintRows();
      input.focus();
    });
  };
})();
