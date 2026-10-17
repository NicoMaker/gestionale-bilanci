(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.pages.budget = {
    title: "Budget",
    icon: "🗓️",
    render(container, ro) {
      const S = GB.store;
      const Y = S.anno;
      const live = GB.live();
      const B = () => S.R.bud;

      /* ── parametri / legenda ── */
      const P = S.ds.par[Y] || {};
      const pInp = (campo, val) => GB.numInput(val || 0, { readonly: ro, dec: 2, cls: "w-mo", onCommit: (v) => S.saveParam(Y, campo, v === null ? 0 : v) });
      const legend = h("div", { class: "card" },
        h("div", { class: "card-h" }, h("h3", null, `Parametri del budget ${Y + 1}`)),
        h("div", { class: "card-b" },
          h("div", { style: { display: "flex", gap: "28px", flexWrap: "wrap", alignItems: "center", marginBottom: "12px" } },
            h("div", null, h("b", null, "i"), " : Inflazione prevista (%) ", pInp("inflazione", P.inflazione)),
            h("div", null, h("b", null, "p"), " : Maggior produttività prevista (%) ", pInp("produttivita", P.produttivita)),
            h("div", { class: "muted" }, h("b", null, "o"), " : valore come anno precedente = 1"),
            h("div", { class: "muted" }, h("b", null, "z"), " : valore azzerato = 0")),
          h("div", { class: "small muted" },
            h("b", null, "Ripartizione valori per tipo → "), "I, F: 1 + i · P: 1 + p · IP, V: (1 + i)(1 + p) · O: 1 · Z: 0. ",
            h("b", null, "Variazioni manuali → "), "vuoto = applica il fattore del tipo · numero con decimali (es. 1,10 o 0,95) = moltiplicatore del valore consolidato · numero intero (es. 5000 o −2000) = importo sommato al consolidato.")));

      /* ── tabella ── */
      const table = h("table", { class: "fin" });
      table.append(h("thead", null, h("tr", null,
        h("th", { class: "l" }, "Ricavi e Costi"), h("th", null, "Tipo"),
        h("th", null, "Consolidato " + Y), h("th", null, "%"), h("th", null, "Ripartiz."), h("th", null, "Variaz. manuali"),
        h("th", null, "Previsione " + (Y + 1)), h("th", null, "%"), h("th", null, "Diff. % su cons."))));
      const tb = h("tbody"); table.append(tb);
      const span = 9;

      const pctCells = (tr, getC, getH, cls) => {
        const d = h("td", { class: "pc" }), i = h("td", { class: "pc" }), j = h("td", { class: "pc" });
        return { d, i, j, bind() {
          live.add(d, (e) => { const r = B().C.ricavi; const v = getC(); e.textContent = r && v ? fmt.pt((v / r) * 100) : ""; });
          live.add(i, (e) => { const r = B().H.ricavi; const v = getH(); e.textContent = r && v ? fmt.pt((v / r) * 100) : ""; });
          live.add(j, (e) => {
            const rc = B().C.ricavi, rh = B().H.ricavi; const vc = getC(), vh = getH();
            const dd = rc ? ((vc || 0) / rc) * 100 : 0, ii = rh ? ((vh || 0) / rh) * 100 : 0;
            e.textContent = (vc || vh) && (rc || rh) ? fmt.pt(ii - dd) : "";
          });
        } };
      };

      const sectionBlock = (id, totKey) => {
        const def = T.SEZIONI.CE.find((s) => s.id === id);
        tb.append(h("tr", { class: "sec" }, h("td", { colspan: span }, def.label)));
        S.ds.voci.filter((v) => v.sezione === id).forEach((v) => {
          const tr = h("tr", { class: "line" });
          tr.append(h("td", { class: "l" }, v.descrizione || h("span", { class: "muted" }, "(senza nome)")));
          tr.append(h("td", { class: "l", style: { fontFamily: "var(--mono)", fontWeight: 700 } }, (v.tipo || "—").toUpperCase()));
          const c = h("td", { class: "n" }), f = h("td", { class: "n" }), hh = h("td", { class: "n" });
          const G = S.ds.bvar[v.id] ? S.ds.bvar[v.id][Y] : undefined;
          const g = GB.numInput(G === undefined ? null : G, { readonly: ro, dec: 4, cls: "w-yr", onCommit: (val) => S.saveBudgetVar(v.id, Y, val) });
          g.dataset.col = "g";
          const row = () => B().righe[v.id] || { C: 0, F: 0, H: 0 };
          const pc = pctCells(tr, () => row().C, () => row().H);
          live.add(c, (e) => GB.setNum(e, row().C));
          live.add(f, (e) => { e.textContent = fmt.num(row().F, 4); });
          live.add(hh, (e) => GB.setNum(e, row().H));
          pc.bind();
          tr.append(c, pc.d, f, h("td", { class: "n" }, g), hh, pc.i, pc.j);
          tb.append(tr);
        });
        totalRow(def.tot, "sub", () => B().sezC[id], () => B().sez[id]);
      };

      const totalRow = (label, cls, getC, getH, opts = {}) => {
        const tr = h("tr", { class: cls }, h("td", { class: "l" }, label), h("td"));
        const c = h("td", { class: "n" }), hh = h("td", { class: "n" });
        const fmtFn = (e, v) => {
          if (opts.fmt === "pct100") e.textContent = v == null ? "" : fmt.pt(v) + " %";
          else if (opts.fmt === "int") e.textContent = fmt.num(v, 2);
          else if (opts.fmt === "date") { const d = window.Calc.dayLabel(v); e.textContent = d ? (d.oltre ? "oltre il 31 dic" : d.giornoMese + " " + T.MESI[d.mese].slice(0, 3).toLowerCase()) : ""; }
          else GB.setNum(e, v);
        };
        live.add(c, (e) => fmtFn(e, getC()));
        live.add(hh, (e) => fmtFn(e, getH()));
        const pc = pctCells(tr, getC, getH);
        if (opts.nopct) tr.append(c, h("td", { class: "pc" }), h("td"), h("td"), hh, h("td", { class: "pc" }), h("td", { class: "pc" }));
        else { pc.bind(); tr.append(c, pc.d, h("td"), h("td"), hh, pc.i, pc.j); }
        tb.append(tr);
      };
      const R = (label, key, cls, opts) => totalRow(label, cls || "big", () => B().C[key], () => B().H[key], opts);

      tb.append(h("tr", { class: "title" }, h("td", { colspan: span }, "Conto economico previsionale " + (Y + 1))));
      sectionBlock("C_RICAVI");
      totalRow("MAGAZZINO RIM. INIZIALI", "sub", () => B().sezC.C_RIM_INIZ, () => B().sez.C_RIM_INIZ);
      sectionBlock("C_ACQUISTI");
      totalRow("MAGAZZINO RIM. FINALI", "sub", () => B().sezC.C_RIM_FIN, () => B().sez.C_RIM_FIN);
      R("COSTO MATERIE PRIME", "costo_mp");
      sectionBlock("C_PRODUTTIVI");
      R("COSTO DEL VENDUTO", "costo_venduto");
      R("1° MARGINE OPERATIVO", "margine1");
      ["C_PERSONALE", "C_COMMERCIALI", "C_AMMINISTRATIVI", "C_AMMORTAMENTI", "C_ONERI_TRIB"].forEach((id) => sectionBlock(id));
      R("TOTALE COSTI OPERATIVI", "costi_operativi");
      R("EBITDA", "ebitda");
      R("2° MARGINE OPERATIVO (EBIT)", "ebit");
      ["C_ONERI_FIN", "C_PROVENTI_FIN"].forEach((id) => sectionBlock(id));
      R("RISULTATO GESTIONALE", "risultato_gest");
      ["C_RICAVI_EXTRA", "C_COSTI_EXTRA"].forEach((id) => sectionBlock(id));
      R("UTILE ANTE IMPOSTE", "ante_imposte");

      // imposte: consolidato (da C.E.) + input previsione
      {
        const tr = h("tr", { class: "line" }, h("td", { class: "l" }, "IMPOSTE ESERCIZIO"), h("td"));
        const c = h("td", { class: "n" });
        live.add(c, (e) => GB.setNum(e, B().C.imposte));
        const inp = GB.numInput(P.imposte_budget || null, { readonly: ro, cls: "w-yr", onCommit: (v) => S.saveParam(Y, "imposte_budget", v === null ? 0 : v) });
        inp.dataset.col = "g";
        tr.append(c, h("td"), h("td"), h("td"), h("td", { class: "n" }, inp), h("td"), h("td"));
        tb.append(tr);
      }
      R("UTILE BILANCIO", "utile", "grand", { nopct: false });

      tb.append(h("tr", { class: "spacer" }, h("td", { colspan: span })));
      tb.append(h("tr", { class: "title" }, h("td", { colspan: span }, "Analisi del punto di pareggio (BEP)")));
      R("TOTALE SPESE FISSE", "spese_fisse", "sub");
      R("TOTALE SPESE VARIABILI", "spese_var", "sub");
      R("COSTO MATERIE PRIME", "costo_mp", "sub");
      R("% PUNTO PAREGGIO AZIENDALE", "bep_pct", "sub", { fmt: "pct100", nopct: true });
      R("FATTURATO MINIMO PER BEP", "bep_fatturato", "sub", { nopct: true });
      R("GIORNO BEP AZIENDALE", "bep_giorno", "sub", { fmt: "int", nopct: true });
      R("DATA BEP AZIENDALE", "bep_giorno", "sub", { fmt: "date", nopct: true });
      GB.gridNav(table);

      container.append(
        GB.printHead(`Budget ${Y + 1}`, `Base consolidata: esercizio ${Y}`),
        legend,
        h("div", { class: "tbl-wrap free" + (ro ? " ro" : "") }, table));
      return { update: () => live.update() };
    },
  };
})();
