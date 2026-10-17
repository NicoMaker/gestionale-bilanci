(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.pages.rating = {
    title: "Rating (indicatori creditizi)",
    icon: "🎯",
    render(container, ro) {
      const S = GB.store;
      const years = S.R.tutti; // tutti gli esercizi in colonna (si scorre in orizzontale)
      container.classList.add("fit");
      const live = GB.live();
      const R = (a) => S.R.anni[a].rating;
      const table = h("table", { class: "fin" });
      GB.printFit(table, 220, 150, years.length);
      const head = h(
        "tr",
        null,
        h("th", { class: "l stk0" }, "Indicatori creditizi"),
      );
      years.forEach((a) =>
        head.append(
          h("th", { class: "gap" }),
          h("th", null, String(a)),
          h("th", null, "%"),
        ),
      );
      table.append(h("thead", null, head));
      const tb = h("tbody");
      table.append(tb);
      const span = 1 + years.length * 3;

      const title = (t, c1, c2) => {
        const tr = h("tr", { class: "title" }, h("td", { class: "stk0" }, t));
        years.forEach(() =>
          tr.append(
            h("td"),
            h("td", { style: { textAlign: "right" } }, c1 || ""),
            h("td", { style: { textAlign: "right" } }, c2 || ""),
          ),
        );
        tb.append(tr);
      };
      const line = (label, valFn, pctFn, cls) => {
        const tr = h(
          "tr",
          { class: cls || "line" },
          h("td", { class: "l stk0" }, label),
        );
        years.forEach((a) => {
          const v = h("td", { class: "n" }),
            p = h("td", { class: "pc" });
          tr.append(h("td", { class: "gap" }), v, p);
          live.add(v, (e) => GB.setNum(e, valFn(R(a))));
          live.add(p, (e) => {
            const x = pctFn ? pctFn(R(a)) : null;
            e.textContent = x == null ? "" : fmt.pct(x);
          });
        });
        tb.append(tr);
      };
      const ind = (label, key, sKey, f) => {
        const tr = h(
          "tr",
          { class: "line" },
          h("td", { class: "l stk0" }, label),
        );
        years.forEach((a) => {
          const v = h("td", { class: "n" }),
            s = h("td", { class: "n", style: { fontWeight: 700 } });
          tr.append(h("td", { class: "gap" }), v, s);
          live.add(v, (e) => {
            const x = R(a)[key];
            e.textContent = x == null ? "n.d." : f(x);
          });
          live.add(s, (e) => {
            e.textContent = R(a)[sKey];
          });
        });
        tb.append(tr);
      };

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
      ind(
        "Attivo Circolante / Passivo Circolante   (≥ 1,20)",
        "i1",
        "s1",
        (x) => fmt.num(x, 2),
      );
      ind("Mezzi propri / Totale Passivo   (≥ 5%)", "i2", "s2", (x) =>
        fmt.pct(x),
      );
      ind("Oneri Finanziari / Fatturato   (≤ 5%)", "i3", "s3", (x) =>
        fmt.pct(x),
      );
      ind("Cash Flow / Totale Attivo   (≥ 4%)", "i4", "s4", (x) => fmt.pct(x));
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
                  r.rating_desc ||
                  "Punteggio inferiore a 6: sotto la soglia CCC",
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

      // legenda in una riga sopra la tabella: così la tabella occupa il resto della finestra e la barra orizzontale resta in fondo
      const legend = h(
        "div",
        { class: "legend-line" },
        h("span", { class: "muted" }, "Legenda rating: "),
        Object.entries(window.Calc.RATING_LABEL).map(([k, v]) =>
          h(
            "span",
            { class: "lg" },
            h("b", null, k),
            " " +
              String(v)
                .replace(/^Rischio /, "")
                .toLowerCase(),
          ),
        ),
      );
      container.append(
        GB.printHead(
          "Rating — indicatori creditizi",
          "Esercizi " + years.join(" · "),
        ),
        legend,
        h("div", { class: "tbl-wrap free" }, table),
      );
      return { update: () => live.update() };
    },
  };
})();
