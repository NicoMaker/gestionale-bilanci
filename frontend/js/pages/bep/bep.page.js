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
      /* ── confronto del punto di pareggio di tutti gli esercizi (budget dell'anno successivo a ciascuno) ── */
      const mrow = (label, get, kind, cls) => ({
        label,
        get,
        kind: kind || "num",
        cls: cls || "line",
      });
      const multi = GB.multiTable({
        title: "Punto di pareggio di tutti gli esercizi",
        hint: "clicca un esercizio per aprirlo",
        first: "Budget dell'anno successivo",
        head: (e) => `Budget ${e.anno + 1}`,
        sub: (e) => "base " + e.anno,
        rows: [
          mrow("Fatturato di budget", (e) => e.bud.H.ricavi, "num", "sub"),
          mrow("Spese fisse", (e) => e.bud.H.spese_fisse),
          mrow(
            "Costi variabili (materie prime + spese variabili)",
            (e) => e.bud.H.costo_mp + e.bud.H.spese_var,
          ),
          mrow(
            "Margine di contribuzione",
            (e) => (e.bud.H.ricavi ? 1 - e.bep.var_pct : null),
            "pct",
          ),
          mrow(
            "Fatturato minimo per BEP",
            (e) => e.bud.H.bep_fatturato,
            "num",
            "big",
          ),
          mrow("% punto di pareggio", (e) => e.bud.H.bep_pct, "pt"),
          mrow(
            "Margine di sicurezza (ricavi − BEP) / ricavi",
            (e) =>
              e.bud.H.ricavi && e.bud.H.bep_fatturato != null
                ? (e.bud.H.ricavi - e.bud.H.bep_fatturato) / e.bud.H.ricavi
                : null,
            "pct",
          ),
          mrow(
            "Data BEP aziendale",
            (e) => dataTxt(e.bud.H.bep_giorno),
            "text",
          ),
          mrow(
            "Pareggio raggiunto a",
            (e) =>
              !e.bud.H.ricavi
                ? ""
                : e.bep.mese_pareggio == null
                  ? "non raggiunto"
                  : T.MESI[e.bep.mese_pareggio],
            "text",
          ),
        ],
      });
      const mChart = h("div", { class: "card-b" });
      const drawMulti = () =>
        mChart.replaceChildren(
          GB.chart({
            labels: S.M.map((e) => String(e.anno + 1)),
            bars: [
              {
                name: "Fatturato di budget",
                color: "var(--accent)",
                values: S.M.map((e) => e.bud.H.ricavi),
              },
              {
                name: "Fatturato minimo BEP",
                color: "var(--green)",
                values: S.M.map((e) => e.bud.H.bep_fatturato),
              },
              {
                name: "Spese fisse",
                color: "var(--yellow)",
                values: S.M.map((e) => e.bud.H.spese_fisse),
              },
            ],
            height: 260,
          }),
        );
      drawMulti();

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
        multi.el,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h(
              "h3",
              null,
              "Fatturato di budget e punto di pareggio per esercizio",
            ),
          ),
          mChart,
        ),
      );
      return {
        update: () => {
          draw();
          multi.update();
          drawMulti();
        },
      };
    },
  };
})();
