/* Contenuto della tabella: sintesi S.P., dati C.E. e i 4 principali indicatori con scoring. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.rating.sezioni = function (
    { years, tb, span },
    { title, line, ind },
  ) {
    title("Sintesi di Stato Patrimoniale", "Importo", "%");
    line(
      "Rimanenze",
      (r) => r.rimanenze,
      (r) => r.pct.rimanenze,
    );
    line(
      "Altro Attivo Circolante",
      (r) => r.altro_ac,
      (r) => r.pct.altro_ac,
    );
    line(
      "Immobilizzazioni",
      (r) => r.immobilizzazioni,
      (r) => r.pct.immobilizzazioni,
    );
    line(
      "Totale attivo",
      (r) => r.totale_attivo,
      (r) => (r.totale_attivo ? 1 : null),
      "sub",
    );
    line(
      "Passivo Circolante",
      (r) => r.passivo_circ,
      (r) => r.pct.passivo_circ,
    );
    line(
      "Passivo a M/L termine",
      (r) => r.passivo_ml,
      (r) => r.pct.passivo_ml,
    );
    line(
      "Mezzi Propri",
      (r) => r.mezzi_propri,
      (r) => r.pct.mezzi_propri,
    );
    line(
      "Totale passivo",
      (r) => r.totale_passivo,
      (r) => (r.totale_passivo ? 1 : null),
      "sub",
    );
    tb.append(h("tr", { class: "spacer" }, h("td", { colspan: span })));
    title("Dati di Conto Economico", "Importo", "");
    line("Fatturato", (r) => r.fatturato);
    line("Ammortamenti", (r) => r.ammortamenti);
    line("Oneri Finanziari", (r) => r.oneri_fin);
    line("Utile (perdita) di periodo", (r) => r.utile, null, "sub");
    tb.append(h("tr", { class: "spacer" }, h("td", { colspan: span })));
    title(
      "Principali indicatori  (tra parentesi il valore ottimale)",
      "Valore",
      "Scoring",
    );
    ind("Attivo Circolante / Passivo Circolante   (≥ 1,20)", "i1", "s1", (x) =>
      fmt.num(x, 2),
    );
    ind("Mezzi propri / Totale Passivo   (≥ 5%)", "i2", "s2", (x) =>
      fmt.pct(x),
    );
    ind("Oneri Finanziari / Fatturato   (≤ 5%)", "i3", "s3", (x) => fmt.pct(x));
    ind("Cash Flow / Totale Attivo   (≥ 4%)", "i4", "s4", (x) => fmt.pct(x));
  };
})();
