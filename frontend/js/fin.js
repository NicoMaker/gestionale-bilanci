/* Costruttore generico di tabelle a "righe di conto" per 3 anni (Stato Patrimoniale / Conto Economico). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  /* Piccoli helper condivisi dalle pagine */
  GB.ctx = () => GB.store;
  GB.yearHeads = (years) => years.map((a) => String(a));

  /* In stampa (A4 orizzontale) una tabella con molti anni non entra: si riduce con zoom in proporzione.
     fixed = larghezza stimata delle colonne fisse (px), perYear = larghezza stimata di ogni anno. */
  GB.printFit = (table, fixed, perYear, n) => {
    const scale = Math.min(1, 1020 / (fixed + perYear * n));
    table.style.setProperty("--pz", scale.toFixed(3));
  };

  // pulsante "aggiungi anno" dentro le pagine con tutti gli esercizi in colonna
  GB.addAnnoBtn = () => h("button", { class: "btn sm", title: "Aggiunge l'anno successivo all'ultimo esercizio", onclick: async () => {
    try { const a = await GB.store.addAnno(); GB.toast("Anno " + a + " aggiunto"); } catch (e) { /* toast già mostrato */ }
  } }, "＋ Aggiungi anno");

  GB.printHead = (title, sub) => {
    const S = GB.store;
    return h("div", { class: "print-head" },
      h("div", { class: "t" }, title),
      h("div", { class: "s" }, h("div", null, S.cliente ? S.cliente.ragione_sociale + (S.cliente.partita_iva ? " — P.IVA " + S.cliente.partita_iva : "") : ""),
        h("div", null, sub || ""), h("div", null, "Stampato il " + new Date().toLocaleDateString("it-IT"))));
  };

  /* fin.build({ ambito:'SP'|'CE', layout:[…], years, getY(a)->oggetto calcolato, den(a,item)->denominatore %, pctFn }, readonly)
     layout item: {t:'title',label} | {t:'sec',id,label,totLabel,key,noHeader,noTotal} | {t:'row',cls,label,key,fmt,pct:false}
                | {t:'check', label, key} | {t:'spacer'} */
  // elimina una riga: se non contiene dati si elimina subito, altrimenti si chiede conferma indicando quanti valori si perdono
  GB.deleteVoceFlow = async (v) => {
    const S = GB.store;
    const nz = (o) => Object.values(o || {}).filter((x) => x !== null && x !== undefined).length;
    let n = nz(S.ds.val[v.id]) + nz(S.ds.bvar[v.id]);
    for (const arr of Object.values(S.ds.cf[v.id] || {})) n += arr.filter((x) => x).length;
    if (n === 0) return S.deleteVoce(v.id).catch(() => {});
    if (await GB.confirm(`La riga “${v.descrizione || "(senza nome)"}” contiene ${n} valori inseriti. Eliminarla insieme ai suoi dati?`)) S.deleteVoce(v.id).catch(() => {});
  };

  GB.fin = {
    build(cfg, ro) {
      const S = GB.store;
      const live = GB.live();
      const years = cfg.years;
      const ce = cfg.ambito === "CE";
      const wrap = h("div", { class: "tbl-wrap" + (ro ? " free ro" : "") });
      const table = h("table", { class: "fin" });
      wrap.append(table);
      const colsPerYear = 2;

      // intestazione: Cod. e Descrizione restano fissi a sinistra mentre si scorrono gli anni
      const hr = h("tr", null, h("th", { class: "l stk1" }, "Cod."), h("th", { class: "l stk2" }, cfg.titleCol || "Descrizione"));
      if (ce) hr.append(h("th", null, "Tipo"));
      years.forEach((a) => {
        const canDel = !ro && S.anni.length > 1 && S.anni.includes(a);
        hr.append(h("th", { class: "gap" }),
          h("th", { class: "yr" }, String(a), canDel ? h("button", { class: "xbtn no-ro", title: `Elimina l'anno ${a}`, onclick: () => GB.eliminaAnno(a) }, "✕") : null),
          h("th", null, "%"));
      });
      hr.append(h("th", { class: "no-ro" }, ""));
      table.append(h("thead", null, hr));
      const tb = h("tbody");
      table.append(tb);
      const span = 2 + (ce ? 1 : 0) + years.length * 3 + 1;
      GB.printFit(table, 250 + (ce ? 40 : 0), 122, years.length);

      const calcOf = (a) => cfg.getY(a);
      const denOf = (a, item) => cfg.den(a, item);
      const pctCell = (a, getVal, item) => h("td", { class: "pc" }, (() => { const td = h("span"); live.add(td, (e) => {
        const d = denOf(a, item); const v = getVal(a);
        e.textContent = d && v ? fmt.pt(cfg.pctMul ? (v / d) * cfg.pctMul : (v / d) * 100) : "";
      }); return td; })());

      for (const item of cfg.layout) {
        if (item.t === "title") {
          tb.append(h("tr", { class: "title" }, h("td", { colspan: span }, h("span", { class: "stk-label" }, item.label))));
        } else if (item.t === "spacer") {
          tb.append(h("tr", { class: "spacer" }, h("td", { colspan: span })));
        } else if (item.t === "sec") {
          const voci = S.ds.voci.filter((v) => v.sezione === item.id);
          if (!item.noHeader) tb.append(h("tr", { class: "sec" }, h("td", { colspan: span }, h("span", { class: "stk-label" }, item.label))));
          voci.forEach((v) => {
            const tr = h("tr", { class: "line" });
            tr.append(h("td", { class: "l stk1" }, h("input", { class: "ci cod", "data-col": "cod", value: v.codice || "", placeholder: "cod.", readonly: ro || null,
              onchange: (e) => S.updateVoce(v.id, { codice: e.target.value }) })));
            tr.append(h("td", { class: "l stk2" }, h("input", { class: "ci desc", "data-col": "desc", "data-voce": v.id, value: v.descrizione || "", placeholder: "descrizione…", readonly: ro || null,
              onchange: (e) => S.updateVoce(v.id, { descrizione: e.target.value }) })));
            if (ce) {
              if (item.id === "C_IMPOSTE") tr.append(h("td"));
              else if (ro) tr.append(h("td", { class: "l" }, v.tipo || ""));
              else {
                const sel = h("select", { class: "ci", title: "Tipo riga (usato in Budget e Punto di pareggio)", onchange: (e) => S.updateVoce(v.id, { tipo: e.target.value }) },
                  [h("option", { value: "" }, "—")].concat(window.Template.TIPI.map((t) => h("option", { value: t.v, title: t.d }, t.v))));
                sel.value = (v.tipo || "").toUpperCase();
                tr.append(h("td", { class: "l" }, sel));
              }
            }
            years.forEach((a, yi) => {
              const cur = S.ds.val[v.id] ? S.ds.val[v.id][a] : undefined;
              const inp = GB.numInput(cur === undefined ? null : cur, { readonly: ro, cls: "w-yr", onCommit: (val) => S.saveValore(v.id, a, val) });
              inp.dataset.col = "y" + yi;
              tr.append(h("td", { class: "gap" }), h("td", { class: "n" }, inp));
              tr.append(pctCell(a, (yy) => (S.ds.val[v.id] ? S.ds.val[v.id][yy] || 0 : 0), item));
            });
            tr.append(h("td", { class: "no-ro" }, v.fissa ? "" : h("button", { class: "xbtn", title: "Elimina riga", onclick: () => GB.deleteVoceFlow(v) }, "✕")));
            tb.append(tr);
          });
          if (!item.single && !ro) {
            tb.append(h("tr", { class: "add no-ro" }, h("td", { colspan: span }, h("span", { class: "stk-label" }, h("button", { class: "addbtn", onclick: () => S.addVoce(cfg.ambito, item.id) }, "+ aggiungi riga")))));
          }
          if (!item.noTotal) {
            tb.append(this.totalRow(item.totLabel || "Totale " + item.label, item.id, "sub", cfg, live, years, ce, Object.assign({}, item, { sez: true })));
          }
        } else if (item.t === "row") {
          tb.append(this.totalRow(item.label, item.key, item.cls || "big", cfg, live, years, ce, item));
        } else if (item.t === "check") {
          const tr = h("tr", { class: "chk" }, h("td", { class: "stk1" }), h("td", { class: "l stk2" }, item.label));
          if (ce) tr.append(h("td"));
          years.forEach((a) => {
            const c = h("td", { class: "n" });
            tr.append(h("td", { class: "gap" }), c, h("td", { class: "pc" }));
            live.add(c, (e) => { const v = calcOf(a)[item.key]; e.textContent = fmt.num(v); });
          });
          tr.append(h("td", { class: "no-ro" }));
          live.add(tr, (e) => { const ok = years.every((a) => Math.abs(calcOf(a)[item.key]) < 0.005); e.classList.toggle("ok", ok); e.classList.toggle("ko", !ok); });
          tb.append(tr);
        }
      }
      GB.gridNav(table);
      return { el: wrap, update: () => live.update() };
    },

    totalRow(label, key, cls, cfg, live, years, ce, item) {
      const tr = h("tr", { class: cls }, h("td", { class: "stk1" }), h("td", { class: "l stk2" }, label));
      if (ce) tr.append(h("td"));
      years.forEach((a) => {
        const c = h("td", { class: "n" });
        const p = h("td", { class: "pc" });
        tr.append(h("td", { class: "gap" }), c, p);
        const getter = (yy) => {
          const o = cfg.getY(yy);
          if (item.sez) return o.sez ? o.sez[key] : o[key];
          return o[key];
        };
        live.add(c, (e) => {
          const v = getter(a);
          if (item.fmt === "pt") e.textContent = fmt.pt(v);
          else if (item.fmt === "pct100") e.textContent = fmt.pt(v) + (v == null ? "" : " %");
          else if (item.fmt === "pctfrac") e.textContent = v == null ? "" : fmt.pct(v);
          else if (item.fmt === "int") e.textContent = fmt.num(v, 2);
          else if (item.fmt === "date") { const d = window.Calc.dayLabel(v); e.textContent = d ? (d.oltre ? "oltre il 31 dic" : d.giornoMese + " " + window.Template.MESI[d.mese].slice(0, 3).toLowerCase()) : ""; }
          else GB.setNum(e, v);
        });
        live.add(p, (e) => {
          if (item.nopct) { e.textContent = ""; return; }
          const d = cfg.den(a, item), v = getter(a);
          e.textContent = d && v ? fmt.pt((v / d) * 100) : "";
        });
      });
      tr.append(h("td", { class: "no-ro" }));
      return tr;
    },
  };
})();
