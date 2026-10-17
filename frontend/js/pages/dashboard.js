(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.pages.dashboard = {
    title: "Riepilogo cliente",
    icon: "📊",
    render(container) {
      const S = GB.store;
      const Y = S.anno;
      const cur = S.R.anni[Y];
      const bud = S.R.bud;
      const rows = window.Calc.riepilogo(S.ds);

      const kpi = (l, v, s) => h("div", { class: "kpi" }, h("div", { class: "l" }, l), h("div", { class: "v" }, v), s ? h("div", { class: "s" }, s) : null);
      const prev = S.R.anni[Y - 1];
      const delta = (a, b) => (b ? (a - b >= 0 ? "▲ " : "▼ ") + fmt.pct(Math.abs((a - b) / Math.abs(b)), 1) + " vs " + (Y - 1) : "");
      const kpis = h("div", { class: "kpis" },
        kpi(`Ricavi ${Y}`, fmt.eur(cur.ce.ricavi), delta(cur.ce.ricavi, prev.ce.ricavi)),
        kpi("EBITDA", fmt.eur(cur.ce.ebitda), cur.ce.ricavi ? fmt.pct(cur.ce.ebitda / cur.ce.ricavi) + " dei ricavi" : ""),
        kpi("EBIT", fmt.eur(cur.ce.ebit), cur.ind.ros != null ? "ROS " + fmt.pct(cur.ind.ros) : ""),
        kpi("Utile di bilancio", fmt.eur(cur.ce.utile), cur.ind.roe != null ? "ROE " + fmt.pct(cur.ind.roe) : ""),
        kpi("Rating", cur.rating.rating || "n.d.", cur.rating.rating ? cur.rating.rating_desc + " · punteggio " + cur.rating.punteggio + "/12" : cur.rating.vuoto ? "nessun dato" : "punteggio " + cur.rating.punteggio + "/12"),
        kpi("Current ratio", cur.ind.current_ratio == null ? "n.d." : fmt.num(cur.ind.current_ratio, 2), "Attivo circolante / Passività correnti"),
        kpi(`Budget ${Y + 1} · ricavi`, fmt.eur(bud.H.ricavi), `EBIT ${fmt.eur(bud.H.ebit)} · utile ${fmt.eur(bud.H.utile)}`),
        kpi("Pareggio (BEP) budget", fmt.eur(bud.H.bep_fatturato), bud.H.bep_pct != null ? fmt.pt(bud.H.bep_pct) + " % del fatturato" : ""));

      const alerts = [];
      rows.forEach((r) => { if (!r.vuoto && Math.abs(r.check) >= 0.005) alerts.push(h("div", { class: "note", style: { borderLeftColor: "var(--red)" } }, `⚠️ ${r.anno}: lo Stato Patrimoniale non quadra (differenza ${fmt.num(r.check)}).`)); });

      const table = h("table", { class: "fin" });
      table.append(h("thead", null, h("tr", null, ["Esercizio", "Ricavi", "EBITDA", "EBIT", "Utile", "Totale attivo", "Patrimonio netto", "ROE", "ROS", "Current ratio", "Rating", "S.P."].map((t, i) => h("th", { class: i === 0 ? "l" : "" }, t)))));
      const tb = h("tbody"); table.append(tb);
      rows.forEach((r) => {
        const tr = h("tr", { class: "line", style: { cursor: "pointer", fontWeight: r.anno === Y ? 700 : 400 }, title: "Apri questo esercizio", onclick: () => S.setYear(r.anno) },
          h("td", { class: "l" }, String(r.anno) + (r.anno === Y ? "  ◀" : "")),
          ...[r.ricavi, r.ebitda, r.ebit, r.utile, r.attivo, r.pn].map((v) => h("td", { class: "n" + (v < 0 ? " neg" : "") }, fmt.num(v, 0))),
          h("td", { class: "n" }, r.roe == null ? "" : fmt.pct(r.roe, 1)), h("td", { class: "n" }, r.ros == null ? "" : fmt.pct(r.ros, 1)),
          h("td", { class: "n" }, r.current_ratio == null ? "" : fmt.num(r.current_ratio, 2)),
          h("td", { class: "n" }, r.vuoto ? "" : h("span", { class: "rating " + (r.rating ? "r-" + r.rating : "r-nd"), style: { fontSize: "13px", padding: "1px 8px", minWidth: "40px" } }, r.rating || "n.d.")),
          h("td", { class: "n" }, r.vuoto ? "" : Math.abs(r.check) < 0.005 ? h("span", { class: "pill ok" }, "OK") : h("span", { class: "pill ko" }, "≠ 0")));
        tb.append(tr);
      });

      const charts = h("div", { class: "grid2" },
        h("div", { class: "card" }, h("div", { class: "card-h" }, h("h3", null, "Ricavi e utile per esercizio")),
          h("div", { class: "card-b" }, GB.chart({ labels: rows.map((r) => String(r.anno)), bars: [{ name: "Ricavi", color: "var(--accent)", values: rows.map((r) => r.ricavi) }, { name: "Utile", color: "var(--green)", values: rows.map((r) => r.utile) }], height: 240 }))),
        h("div", { class: "card" }, h("div", { class: "card-h" }, h("h3", null, "Struttura patrimoniale")),
          h("div", { class: "card-b" }, GB.chart({ labels: rows.map((r) => String(r.anno)), bars: [{ name: "Totale attivo", color: "var(--cyan)", values: rows.map((r) => r.attivo) }, { name: "Patrimonio netto", color: "var(--purple)", values: rows.map((r) => r.pn) }], height: 240 }))));

      container.append(
        GB.printHead("Riepilogo cliente", "Esercizio di riferimento " + Y),
        h("div", { class: "card", style: { marginBottom: "18px" } }, h("div", { class: "card-b", style: { display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" } },
          h("div", null, h("div", { class: "small muted" }, "Cliente"), h("div", { style: { fontFamily: "var(--serif)", fontSize: "22px", fontWeight: 600 } }, S.cliente.ragione_sociale)),
          h("div", null, h("div", { class: "small muted" }, "P.IVA"), h("div", null, S.cliente.partita_iva || "—")),
          h("div", null, h("div", { class: "small muted" }, "Anno base"), h("div", null, String(S.cliente.anno_base))),
          S.cliente.note ? h("div", { style: { flex: 1, minWidth: "200px" } }, h("div", { class: "small muted" }, "Note"), h("div", null, S.cliente.note)) : null)),
        ...alerts, kpis,
        h("div", { class: "card" }, h("div", { class: "card-h" }, h("h3", null, "Andamento di tutti gli esercizi"), h("span", { class: "small muted no-print" }, "clicca una riga per aprire l'esercizio")), h("div", { class: "tbl-wrap free", style: { margin: 0, border: "none", borderRadius: 0 } }, table)),
        charts);
      return { update() {} };
    },
  };
})();
