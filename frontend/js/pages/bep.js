(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  const dataTxt = (giorno) => {
    const d = window.Calc.dayLabel(giorno);
    return d
      ? d.oltre
        ? "oltre il 31 dicembre"
        : d.giornoMese + " " + T.MESI[d.mese].toLowerCase()
      : "n.d.";
  };

  GB.pages.bep = {
    title: "Punto di pareggio (BEP)",
    icon: "⚖️",
    render(container) {
      const S = GB.store;
      const Y = S.anno;
      const kpis = h("div", { class: "kpis" });
      const chartBox = h("div", { class: "card-b" });
      const table = h("table", { class: "fin" });
      table.append(
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h("th", { class: "l" }, ""),
            [
              "Vendite (cumulate)",
              "Costi fissi",
              "Costi totali",
              "BEP (fatturato minimo)",
            ].map((x) => h("th", null, x)),
          ),
        ),
      );
      const tb = h("tbody");
      table.append(tb);

      const draw = () => {
        const B = S.R.bud,
          P = S.R.bep,
          H = B.H,
          C = B.C;
        const kp = (l, v, s) =>
          h(
            "div",
            { class: "kpi" },
            h("div", { class: "l" }, l),
            h("div", { class: "v" }, v),
            s ? h("div", { class: "s" }, s) : null,
          );
        kpis.replaceChildren(
          kp(
            `Fatturato minimo BEP ${Y + 1}`,
            fmt.eur(H.bep_fatturato),
            H.ricavi
              ? "Budget ricavi: " + fmt.eur(H.ricavi)
              : "Inserisci i dati del budget",
          ),
          kp(
            "% punto di pareggio",
            H.bep_pct == null ? "n.d." : fmt.pt(H.bep_pct) + " %",
            "del fatturato di budget",
          ),
          kp(
            "Data BEP aziendale",
            dataTxt(H.bep_giorno),
            H.bep_giorno != null
              ? "giorno " + Math.floor(H.bep_giorno) + " dell'anno"
              : "",
          ),
          kp(
            "Margine di contribuzione",
            P.var_pct || H.ricavi ? fmt.pct(1 - P.var_pct) : "n.d.",
            "1 − (materie prime + variabili) / ricavi",
          ),
          kp(
            "Spese fisse di budget",
            fmt.eur(H.spese_fisse),
            `consolidato ${Y}: ${fmt.eur(C.spese_fisse)}`,
          ),
          kp(
            `Pareggio raggiunto a`,
            P.mese_pareggio == null ? "non raggiunto" : T.MESI[P.mese_pareggio],
            "in base alla stagionalità delle vendite",
          ),
        );
        chartBox.replaceChildren(
          GB.chart({
            labels: P.rows.map((r) => r.label),
            lines: [
              {
                name: "Vendite",
                color: "var(--accent)",
                values: P.rows.map((r) => r.vendite),
              },
              {
                name: "Costi totali",
                color: "var(--red)",
                values: P.rows.map((r) => r.totali),
              },
              {
                name: "Costi fissi",
                color: "var(--yellow)",
                dash: "5 4",
                values: P.rows.map((r) => r.fissi),
                nodots: true,
              },
              {
                name: "BEP",
                color: "var(--green)",
                dash: "2 4",
                values: P.rows.map((r) => r.bep),
                nodots: true,
              },
            ],
            height: 300,
          }),
        );
        tb.replaceChildren(
          ...P.rows.map((r) =>
            h(
              "tr",
              { class: "line" },
              h("td", { class: "l" }, r.label),
              h("td", { class: "n" }, fmt.num(r.vendite)),
              h("td", { class: "n" }, fmt.num(r.fissi)),
              h("td", { class: "n" }, fmt.num(r.totali)),
              h("td", { class: "n" }, fmt.num(r.bep)),
            ),
          ),
        );
      };
      draw();
      container.append(
        GB.printHead(
          `Punto di pareggio — budget ${Y + 1}`,
          `Base: esercizio ${Y}`,
        ),
        h(
          "div",
          { class: "note no-print" },
          "Le vendite mensili cumulate sono il fatturato di budget distribuito con la progressiva di stagionalità (pagina Vendite). I costi totali = vendite × (costo materie prime + spese variabili)/ricavi + spese fisse. Il punto di pareggio è dove le vendite superano i costi totali.",
        ),
        kpis,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Diagramma del punto di pareggio"),
          ),
          chartBox,
        ),
        h("div", { class: "tbl-wrap free" }, table),
      );
      return { update: draw };
    },
  };
})();
