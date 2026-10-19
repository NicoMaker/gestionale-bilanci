/* Avvisi in cima: per ogni esercizio con Stato Patrimoniale non quadrato. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.dashboard.avvisi = function (rows) {
    const alerts = [];
    rows.forEach((r) => {
      if (!r.vuoto && Math.abs(r.check) >= 0.005)
        alerts.push(
          h(
            "div",
            { class: "note", style: { borderLeftColor: "var(--red)" } },
            `⚠️ ${r.anno}: lo Stato Patrimoniale non quadra (differenza ${fmt.num(r.check)}).`,
          ),
        );
    });
    return alerts;
  };
})();
