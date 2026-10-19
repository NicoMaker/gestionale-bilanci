/* Righe finali: punteggio totale (max 12) e scoring complessivo con la classe di rating. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.rating.punteggio = function ({ years, live, R, tb }) {
    const tot = h(
      "tr",
      { class: "sub" },
      h("td", { class: "l stk0" }, "Punteggio totale (max 12)"),
    );
    years.forEach((a) => {
      const c = h("td", { class: "n", colspan: 2 });
      tot.append(h("td", { class: "gap" }), c);
      live.add(c, (e) => {
        e.textContent = R(a).punteggio;
      });
    });
    tb.append(tot);
    const sc = h(
      "tr",
      { class: "big" },
      h("td", { class: "l stk0" }, "SCORING COMPLESSIVO"),
    );
    years.forEach((a) => {
      const c = h("td", {
        colspan: 2,
        style: { textAlign: "center", padding: "6px" },
      });
      sc.append(h("td", { class: "gap" }), c);
      live.add(c, (e) => {
        const r = R(a);
        e.replaceChildren(
          h(
            "span",
            {
              class: "rating " + (r.rating ? "r-" + r.rating : "r-nd"),
              title:
                r.rating_desc || "Punteggio inferiore a 6: sotto la soglia CCC",
            },
            r.rating || "n.d.",
          ),
          h(
            "div",
            { class: "small muted" },
            r.rating ? r.rating_desc : r.vuoto ? "nessun dato" : "sotto CCC",
          ),
        );
      });
    });
    tb.append(sc);
  };
})();
