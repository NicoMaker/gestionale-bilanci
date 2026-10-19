/* Grafici del riepilogo: ricavi/utile per esercizio e struttura patrimoniale (attivo vs patrimonio netto). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.dashboard.grafici = function (rows) {
    return h(
      "div",
      { class: "grid2" },
      h(
        "div",
        { class: "card" },
        h(
          "div",
          { class: "card-h" },
          h("h3", null, "Ricavi e utile per esercizio"),
        ),
        h(
          "div",
          { class: "card-b" },
          GB.chart({
            labels: rows.map((r) => String(r.anno)),
            bars: [
              {
                name: "Ricavi",
                color: "var(--accent)",
                values: rows.map((r) => r.ricavi),
              },
              {
                name: "Utile",
                color: "var(--green)",
                values: rows.map((r) => r.utile),
              },
            ],
            height: 240,
          }),
        ),
      ),
      h(
        "div",
        { class: "card" },
        h("div", { class: "card-h" }, h("h3", null, "Struttura patrimoniale")),
        h(
          "div",
          { class: "card-b" },
          GB.chart({
            labels: rows.map((r) => String(r.anno)),
            bars: [
              {
                name: "Totale attivo",
                color: "var(--cyan)",
                values: rows.map((r) => r.attivo),
              },
              {
                name: "Patrimonio netto",
                color: "var(--purple)",
                values: rows.map((r) => r.pn),
              },
            ],
            height: 240,
          }),
        ),
      ),
    );
  };
})();
