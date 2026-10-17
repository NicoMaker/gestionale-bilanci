(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.pages.vendite = {
    title: "Vendite — stagionalità",
    icon: "🛒",
    render(container, ro) {
      const S = GB.store;
      const Y = S.anno, years = S.R.years;
      const live = GB.live();
      const V = () => S.R.vend;
      const table = h("table", { class: "fin" });
      table.append(h("thead", null, h("tr", null, h("th", { class: "l" }, ""), years.map((a) => h("th", null, "ES. " + a)), h("th", null, "FT. MEDIO"), h("th", null, "STAGIO. %"), h("th", null, "PROGRESS. %"))));
      const tb = h("tbody"); table.append(tb);

      // pesi
      const pr = h("tr", { class: "sec" }, h("td", { class: "l" }, "peso (media ponderata)"));
      years.forEach((a, i) => {
        const cur = S.ds.par[a] ? S.ds.par[a].peso_vendite : 1;
        const inp = GB.numInput(cur, { readonly: ro, dec: 2, cls: "w-yr", onCommit: (v) => S.saveParam(a, "peso_vendite", v) });
        inp.dataset.col = "peso" + i;
        pr.append(h("td", { class: "n" }, inp));
      });
      const sw = h("td", { class: "n" }); live.add(sw, (e) => { e.textContent = fmt.num(V().somma_pesi, 2); });
      pr.append(sw, h("td"), h("td"));
      tb.append(pr);

      T.MESI_BREVI.forEach((mn, m) => {
        const tr = h("tr", { class: "line" }, h("td", { class: "l", style: { fontWeight: 600 } }, mn));
        years.forEach((a, i) => {
          const cur = S.ds.vend[a] ? S.ds.vend[a][m] : 0;
          const inp = GB.numInput(cur || null, { readonly: ro, cls: "w-yr", onCommit: (v) => S.saveVendita(a, m + 1, v) });
          inp.dataset.col = "v" + i;
          tr.append(h("td", { class: "n" }, inp));
        });
        const ft = h("td", { class: "n" }), st = h("td", { class: "n" }), pg = h("td", { class: "n" });
        live.add(ft, (e) => GB.setNum(e, V().ft[m]));
        live.add(st, (e) => { e.textContent = fmt.num(V().stag[m], 4); });
        live.add(pg, (e) => { e.textContent = fmt.num(V().prog[m], 4); });
        tr.append(ft, st, pg);
        tb.append(tr);
      });
      const tot = h("tr", { class: "grand" }, h("td", { class: "l" }, "TOT"));
      years.forEach((a, i) => { const c = h("td", { class: "n" }); tot.append(c); live.add(c, (e) => { e.textContent = fmt.num(V().tot[i]); }); });
      const t1 = h("td", { class: "n" }), t2 = h("td", { class: "n" });
      live.add(t1, (e) => { e.textContent = fmt.num(V().ft_tot); });
      live.add(t2, (e) => { e.textContent = fmt.num(V().stag_tot, 4); });
      tot.append(t1, t2, h("td"));
      tb.append(tot);
      GB.gridNav(table);

      const chartBox = h("div", { class: "card-b" });
      const draw = () => {
        const v = V();
        chartBox.replaceChildren(GB.chart({
          labels: T.MESI_BREVI.map((m) => m.slice(0, 3)),
          bars: [{ name: "Stagionalità mensile %", color: "var(--accent)", values: v.stag }],
          lines: [{ name: "Progressiva %", color: "var(--orange)", values: v.prog, y2: true }],
          fmt: (x) => fmt.num(x, 0) + "%", fmt2: (x) => x + "%", height: 260,
        }));
      };
      draw();
      container.append(
        GB.printHead("Vendite — stagionalità", "Esercizi " + years.join(" · ")),
        h("div", { class: "note no-print" }, "Inserisci i ricavi mensili degli ultimi tre esercizi. Il fattore medio è la media ponderata con i pesi indicati; la stagionalità (%) distribuisce il fatturato annuo sui mesi ed è usata per costruire il grafico del punto di pareggio."),
        h("div", { class: "tbl-wrap free" + (ro ? " ro" : "") }, table),
        h("div", { class: "card" }, h("div", { class: "card-h" }, h("h3", null, "Andamento stagionale")), chartBox));
      return { update: () => { live.update(); draw(); } };
    },
  };
})();
