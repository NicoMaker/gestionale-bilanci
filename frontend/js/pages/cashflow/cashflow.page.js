(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.pages.cashflow = {
    title: "Cash Flow",
    icon: "💶",
    render(container, ro) {
      const S = GB.store;
      const Y = S.anno;
      const live = GB.live();
      const CF = () => S.R.cf;
      const table = h("table", { class: "fin" });
      table.append(
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h(
              "th",
              { class: "l", style: { minWidth: "260px" } },
              "CASH FLOW " + (Y + 1),
            ),
            T.MESI.map((m) => h("th", null, m.slice(0, 3).toUpperCase())),
            h("th", null, "TOTALE"),
            h("th", { class: "no-ro" }),
          ),
        ),
      );
      const tb = h("tbody");
      table.append(tb);
      const span = 15;
      const title = (t) =>
        tb.append(h("tr", { class: "title" }, h("td", { colspan: span }, t)));

      const calcRow = (label, cls, fn, withTot) => {
        const tr = h("tr", { class: cls }, h("td", { class: "l" }, label));
        for (let m = 0; m < 12; m++) {
          const c = h("td", { class: "n" });
          tr.append(c);
          live.add(c, (e) => GB.setNum(e, fn(m)));
        }
        const t = h("td", { class: "n" });
        tr.append(t);
        if (withTot)
          live.add(t, (e) =>
            GB.setNum(
              e,
              Array.from({ length: 12 }, (_, m) => fn(m)).reduce(
                (s, x) => s + x,
                0,
              ),
            ),
          );
        tr.append(h("td", { class: "no-ro" }));
        tb.append(tr);
      };

      /* depositi bancari */
      title("DEPOSITI BANCARI");
      {
        const P = S.ds.par[Y] || {};
        const tr = h(
          "tr",
          { class: "line" },
          h("td", { class: "l" }, "Banca — saldo iniziale (gennaio) e riporto"),
        );
        for (let m = 0; m < 12; m++) {
          if (m === 0) {
            const inp = GB.numInput(P.saldo_iniziale_cf || null, {
              readonly: ro,
              cls: "w-mo",
              onCommit: (v) =>
                S.saveParam(Y, "saldo_iniziale_cf", v === null ? 0 : v),
            });
            inp.dataset.col = "m0";
            tr.append(h("td", { class: "n" }, inp));
          } else {
            const c = h("td", { class: "n" });
            tr.append(c);
            live.add(c, (e) => GB.setNum(e, CF().saldo[m]));
          }
        }
        tr.append(h("td"), h("td", { class: "no-ro" }));
        tb.append(tr);
      }
      calcRow("A  SALDO BANCA", "sub", (m) => CF().saldo[m], false);

      const gruppi = (dir) => {
        T.SEZIONI.CF.filter((g) => g.dir === dir).forEach((g) => {
          tb.append(
            h("tr", { class: "sec" }, h("td", { colspan: span }, g.label)),
          );
          S.ds.voci
            .filter((v) => v.sezione === g.id)
            .forEach((v) => {
              const tr = h("tr", { class: "line" });
              tr.append(
                h(
                  "td",
                  { class: "l" },
                  h("input", {
                    class: "ci desc",
                    "data-voce": v.id,
                    value: v.descrizione || "",
                    readonly: ro || null,
                    placeholder: "descrizione…",
                    onchange: (e) =>
                      S.updateVoce(v.id, { descrizione: e.target.value }),
                  }),
                ),
              );
              for (let m = 0; m < 12; m++) {
                const cur =
                  S.ds.cf[v.id] && S.ds.cf[v.id][Y] ? S.ds.cf[v.id][Y][m] : 0;
                const inp = GB.numInput(cur || null, {
                  readonly: ro,
                  cls: "w-mo",
                  onCommit: (val) => S.saveCashflow(v.id, Y, m + 1, val),
                });
                inp.dataset.col = "m" + m;
                tr.append(h("td", { class: "n" }, inp));
              }
              const t = h("td", { class: "n", style: { fontWeight: 700 } });
              live.add(t, (e) =>
                GB.setNum(
                  e,
                  Array.from({ length: 12 }, (_, m) =>
                    CF().cfv(v.id, m),
                  ).reduce((s, x) => s + x, 0),
                ),
              );
              tr.append(
                t,
                h(
                  "td",
                  { class: "no-ro" },
                  h(
                    "button",
                    {
                      class: "xbtn",
                      title: "Elimina riga",
                      onclick: () => GB.deleteVoceFlow(v),
                    },
                    "✕",
                  ),
                ),
              );
              tb.append(tr);
            });
          if (!ro)
            tb.append(
              h(
                "tr",
                { class: "add no-ro" },
                h(
                  "td",
                  { colspan: span },
                  h(
                    "button",
                    { class: "addbtn", onclick: () => S.addVoce("CF", g.id) },
                    "+ aggiungi voce",
                  ),
                ),
              ),
            );
        });
      };

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

      const chartBox = h("div", { class: "card-b" });
      const draw = () =>
        chartBox.replaceChildren(
          GB.chart({
            labels: T.MESI.map((m) => m.slice(0, 3)),
            bars: [
              { name: "Entrate", color: "var(--green)", values: CF().entrate },
              { name: "Uscite", color: "var(--red)", values: CF().uscite },
            ],
            lines: [
              {
                name: "Liquidità banca",
                color: "var(--accent)",
                values: CF().liq,
              },
            ],
            height: 280,
          }),
        );
      draw();

      /* ── confronto di tutti gli esercizi: riepilogo annuale + liquidità mese per mese ── */
      const sum = (a) => a.reduce((s, x) => s + x, 0);
      const mrow = (label, get, cls, kind) => ({
        label,
        get,
        cls: cls || "line",
        kind: kind || "num",
      });
      const minIdx = (a) => a.reduce((bi, x, i) => (x < a[bi] ? i : bi), 0);
      const multi = GB.multiTable({
        title: "Cash flow di tutti gli esercizi",
        hint: "clicca un esercizio per aprirlo e modificarne i valori",
        first: "Piano di tesoreria",
        head: (e) => `Cash flow ${e.anno + 1}`,
        sub: (e) => "base " + e.anno,
        rows: [
          { t: "sec", label: "Riepilogo annuale" },
          mrow("Saldo iniziale banca (gennaio)", (e) => e.cf.saldo[0]),
          mrow("Totale entrate", (e) => sum(e.cf.entrate), "line"),
          mrow("Totale uscite", (e) => sum(e.cf.uscite), "line"),
          mrow(
            "Variazione netta (entrate + uscite)",
            (e) => sum(e.cf.entrate) + sum(e.cf.uscite),
            "sub",
          ),
          mrow("Liquidità a fine anno", (e) => e.cf.liq[11], "big"),
          mrow("Liquidità minima", (e) => Math.min(...e.cf.liq), "line"),
          mrow(
            "Mese con liquidità minima",
            (e) =>
              e.cf.liq.every((x) => x === 0) ? "" : T.MESI[minIdx(e.cf.liq)],
            "line",
            "text",
          ),
          { t: "sec", label: "Liquidità banca a fine mese" },
          ...T.MESI.map((mn, m) =>
            mrow(mn, (e) => e.cf.liq[m], m === 11 ? "sub" : "line"),
          ),
        ],
      });
      const mChart = h("div", { class: "card-b" });
      const drawMulti = () =>
        mChart.replaceChildren(
          GB.yearLines({
            labels: T.MESI.map((m) => m.slice(0, 3)),
            series: {
              name: (e) => `Cash flow ${e.anno + 1}`,
              values: (e) => e.cf.liq,
            },
            height: 280,
          }),
        );
      drawMulti();

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
          chartBox,
        ),
        multi.el,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Liquidità mensile a confronto tra gli esercizi"),
          ),
          mChart,
        ),
      );
      return {
        update: () => {
          live.update();
          draw();
          multi.update();
          drawMulti();
        },
      };
    },
  };
})();
