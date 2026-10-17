(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  const DEFS = [
    { k: "ebitda_mol", l: "EBITDA – MOL", f: "(Ricavi − costi operativi esclusi ammortamenti e oneri finanziari) / Ricavi", t: "pct" },
    { k: "roe", l: "ROE", f: "Utile di bilancio / Patrimonio netto", t: "pct" },
    { k: "roi", l: "ROI", f: "EBIT / (Attivo fisso + Attivo circolante − Passività correnti)", t: "pct" },
    { k: "ros", l: "ROS", f: "EBIT / Ricavi", t: "pct" },
    { k: "margine_tesoreria", l: "MARGINE DI TESORERIA", f: "Attivo circolante − Passività correnti", t: "eur" },
    { k: "current_ratio", l: "CURRENT RATIO", f: "Attivo circolante / Passività correnti", t: "n2" },
    { k: "rotazione_magazzino", l: "ROTAZIONE DEL MAGAZZINO", f: "Costo materie prime / media(Rimanenze iniziali; Rimanenze finali)", t: "n2" },
  ];

  GB.pages.indicatori = {
    title: "Indicatori di performance",
    icon: "📐",
    render(container) {
      const S = GB.store;
      const years = S.R.tutti; // tutti gli esercizi in colonna (si scorre in orizzontale)
      const live = GB.live();
      const table = h("table", { class: "fin" });
      GB.printFit(table, 480, 70, years.length);
      table.append(h("thead", null, h("tr", null, h("th", { class: "l stk0" }, "Indicatore"), h("th", { class: "l" }, "Formula"), years.map((a) => h("th", null, String(a))))));
      const tb = h("tbody"); table.append(tb);
      DEFS.forEach((d) => {
        const tr = h("tr", { class: "line" }, h("td", { class: "l stk0", style: { fontWeight: 700 } }, d.l), h("td", { class: "l muted small" }, d.f));
        years.forEach((a) => {
          const c = h("td", { class: "n", style: { fontSize: "13.5px" } });
          tr.append(c);
          live.add(c, (e) => {
            const v = S.R.anni[a].ind[d.k];
            e.textContent = v == null ? "n.d." : d.t === "pct" ? fmt.pct(v) : d.t === "eur" ? fmt.num(v) : fmt.num(v, 2);
            e.classList.toggle("neg", v != null && v < 0);
          });
        });
        tb.append(tr);
      });
      const chartBox = h("div", { class: "card-b" });
      const card = h("div", { class: "card" }, h("div", { class: "card-h" }, h("h3", null, "Redditività a confronto (%)")), chartBox);
      const drawChart = () => {
        const mk = (k, name, color) => ({ name, color, values: years.map((a) => { const v = S.R.anni[a].ind[k]; return v == null ? null : +(v * 100).toFixed(2); }) });
        chartBox.replaceChildren(GB.chart({ labels: years.map(String), bars: [mk("ebitda_mol", "EBITDA-MOL", "var(--accent)"), mk("roe", "ROE", "var(--green)"), mk("roi", "ROI", "var(--orange)"), mk("ros", "ROS", "var(--purple)")], fmt: (v) => v + "%", height: 240 }));
      };
      drawChart();
      container.append(GB.printHead("Indicatori di performance", "Esercizi " + years.join(" · ")), h("div", { class: "tbl-wrap free" }, table), card);
      return { update: () => { live.update(); drawChart(); } };
    },
  };
})();
