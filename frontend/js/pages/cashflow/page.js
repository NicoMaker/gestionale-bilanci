/* Cash Flow: piano di tesoreria a 12 mesi (entrate, uscite, liquidità banca) collegato all'esercizio base. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.pages.cashflow = {
    title: "Cash Flow",
    icon: "💶",
    render(container, ro) {
      const S = GB.store;
      const PT = GB.parts.cashflow;
      const Y = S.anno;
      const live = GB.live();
      const CF = () => S.R.cf;
      const { table, tb, span, title } = PT.tabella(Y);
      const calcRow = PT.rigaCalcolata({ tb, live });
      PT.depositi({ tb, ro, Y, live, CF, title, calcRow });
      const gruppi = PT.gruppi({ tb, ro, Y, live, CF, span });

      title("ENTRATE DI GESTIONE");
      gruppi("E");
      calcRow("B  TOTALE ENTRATE", "big", (m) => CF().entrate[m], true);
      title("USCITE DI GESTIONE (inserirle con segno −)");
      gruppi("U");
      calcRow("C  TOTALE USCITE", "big", (m) => CF().uscite[m], true);
      calcRow(
        "D  LIQUIDITA' BANCA  (A + B + C)",
        "grand",
        (m) => CF().liq[m],
        false,
      );
      GB.gridNav(table);

      const grafico = PT.grafico(CF);
      const conf = PT.confronto();

      container.append(
        GB.printHead(
          `Cash Flow ${Y + 1}`,
          `Piano di tesoreria collegato all'esercizio ${Y}`,
        ),
        h(
          "div",
          { class: "note no-print" },
          "Il saldo di gennaio è il saldo iniziale; dagli altri mesi il saldo è la liquidità del mese precedente. Le uscite vanno inserite con segno negativo. La liquidità di banca = saldo + entrate + uscite.",
        ),
        h("div", { class: "tbl-wrap" + (ro ? " free ro" : "") }, table),
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Andamento della liquidità"),
          ),
          grafico.box,
        ),
        conf.multi.el,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Liquidità mensile a confronto tra gli esercizi"),
          ),
          conf.mChart,
        ),
      );
      return {
        update: () => {
          live.update();
          grafico.draw();
          conf.multi.update();
          conf.drawMulti();
        },
      };
    },
  };
})();
