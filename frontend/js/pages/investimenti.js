(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.pages.investimenti = {
    title: "Investimenti",
    icon: "🏗️",
    render(container, ro) {
      const S = GB.store;
      const Y = S.anno;
      const live = GB.live();
      const I = () => S.R.inv;
      const P = S.ds.par[Y] || {};

      const mini = (title, rows) => {
        const table = h("table", { class: "fin" });
        table.append(h("thead", null, h("tr", null, h("th", { class: "l" }, title), h("th", null, "Importo"), h("th", null, "%"))));
        const tb = h("tbody"); table.append(tb);
        rows.forEach(([label, vk, pk, cls]) => {
          const a = h("td", { class: "n" }), b = h("td", { class: "pc" });
          live.add(a, (e) => GB.setNum(e, I()[vk]));
          live.add(b, (e) => { const x = pk ? I()[pk] : null; e.textContent = x == null ? "" : fmt.pct(x); });
          tb.append(h("tr", { class: cls || "line" }, h("td", { class: "l" }, label), a, b));
        });
        return h("div", { class: "tbl-wrap free" }, table);
      };

      const inp = (campo, val) => { const i = GB.numInput(val || null, { readonly: ro, cls: "w-yr", onCommit: (v) => S.saveParam(Y, campo, v === null ? 0 : v) }); i.classList.add("input"); return i; };
      const fatt = h("div", { class: "v" });
      const fatt1 = h("div", { class: "s" });
      live.add(fatt, (e) => { e.textContent = fmt.eur(I().fatturato_necessario); });
      live.add(fatt1, (e) => { const r = I(); e.textContent = `Investimento ${fmt.pct(r.f_inv)} · aumento utile ${fmt.pct(r.f_aum)} del fatturato necessario`; });

      /* ── confronto degli investimenti di tutti gli esercizi (ognuno con i propri parametri) ── */
      const mrow = (label, key, cls, kind) => ({ label, cls: cls || "line", kind: kind || "num", get: (e) => e.inv[key] });
      const multi = GB.multiTable({
        title: "Investimenti di tutti gli esercizi",
        hint: "clicca un esercizio per aprirlo e modificarne i valori",
        first: "Budget dell'anno successivo",
        head: (e) => `Budget ${e.anno + 1}`,
        sub: (e) => "base " + e.anno,
        rows: [
          { t: "sec", label: "Budget" },
          mrow("Ricavi", "ricavi", "sub"), mrow("Costi variabili", "costi_var"), mrow("Differenza (volume d'affari − costi variabili)", "differenza"),
          mrow("Costi fissi", "costi_fissi"), mrow("Utile", "utile", "big"),
          { t: "sec", label: "Investimento e richiesta di utile" },
          mrow("Investimento previsto", "investimento"), mrow("Richiesta di aumento utile", "aumento_utile"),
          mrow("Fatturato necessario", "fatturato_necessario", "big"),
          { t: "sec", label: "Nuovo budget considerando l'investimento" },
          mrow("Ricavi", "n_ricavi", "sub"), mrow("Costi variabili", "n_costi_var"), mrow("Costi fissi + investimento", "n_costi_fissi"),
          mrow("Utile", "n_utile", "grand"),
        ],
      });
      const mChart = h("div", { class: "card-b" });
      const drawMulti = () => mChart.replaceChildren(GB.chart({
        labels: S.M.map((e) => String(e.anno + 1)),
        bars: [
          { name: "Utile budget", color: "var(--accent)", values: S.M.map((e) => e.inv.utile) },
          { name: "Utile col nuovo investimento", color: "var(--green)", values: S.M.map((e) => e.inv.n_utile) },
          { name: "Fatturato necessario", color: "var(--orange)", values: S.M.map((e) => e.inv.fatturato_necessario) },
        ], height: 260,
      }));
      drawMulti();

      container.append(
        GB.printHead(`Investimenti — budget ${Y + 1}`, "Incremento di fatturato minimo per coprire i nuovi investimenti"),
        h("div", { class: "note no-print" }, "Incremento di fatturato minimo per coprire nuovi investimenti che hanno effetto sul Conto Economico: Fatturato necessario = (Investimento + Richiesta di aumento utile) / margine sul volume d'affari."),
        h("div", { class: "card" }, h("div", { class: "card-b", style: { display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "center" } },
          h("div", { class: "field", style: { marginBottom: 0 } }, h("label", null, "Investimento previsto (€)"), inp("investimento", P.investimento)),
          h("div", { class: "field", style: { marginBottom: 0 } }, h("label", null, "Richiesta di aumento utile (€)"), inp("aumento_utile", P.aumento_utile)),
          h("div", { class: "kpi", style: { flex: 1, minWidth: "260px" } }, h("div", { class: "l" }, "Fatturato necessario"), fatt, fatt1))),
        h("div", { class: "grid2" },
          mini(`Budget ${Y + 1}`, [
            ["Ricavi", "ricavi", "d_ricavi", "line"],
            ["Costi variabili (materie prime + spese variabili)", "costi_var", "d_var", "line"],
            ["Differenza (volume d'affari − costi variabili)", "differenza", "d_diff", "sub"],
            ["Costi fissi", "costi_fissi", "d_fissi", "line"],
            ["Utile", "utile", "d_utile", "big"],
          ]),
          mini("Nuovo budget considerando l'investimento", [
            ["Ricavi", "n_ricavi", "n_d_ricavi", "line"],
            ["Costi variabili", "n_costi_var", "n_d_var", "line"],
            ["Differenza (volume d'affari − costi variabili)", "n_differenza", "n_d_diff", "sub"],
            ["Costi fissi + investimento", "n_costi_fissi", "n_d_fissi", "line"],
            ["Utile", "n_utile", "n_d_utile", "big"],
          ])),
        multi.el,
        h("div", { class: "card" }, h("div", { class: "card-h" }, h("h3", null, "Utile e fatturato necessario per esercizio")), mChart));
      return { update: () => { live.update(); multi.update(); drawMulti(); } };
    },
  };
})();
