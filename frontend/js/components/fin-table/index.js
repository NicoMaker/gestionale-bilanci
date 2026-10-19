/* Tabella a righe di conto per più anni (Stato Patrimoniale / Conto Economico): assembla le righe dei file vicini. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  /* fin.build({ ambito:'SP'|'CE', layout:[…], years, getY(a)->oggetto calcolato, den(a,item)->denominatore %, pctFn }, readonly)
     layout item: {t:'title',label} | {t:'sec',id,label,totLabel,key,noHeader,noTotal} | {t:'row',cls,label,key,fmt,pct:false}
                | {t:'check', label, key} | {t:'spacer'} */
  GB.fin = {
    build(cfg, ro) {
      const S = GB.store;
      const live = GB.live();
      const years = cfg.years;
      const ce = cfg.ambito === "CE";
      const wrap = h("div", { class: "tbl-wrap" + (ro ? " free ro" : "") });
      const table = h("table", { class: "fin" });
      wrap.append(table);

      table.append(h("thead", null, GB.finHeader(cfg, ro)));
      const tb = h("tbody");
      table.append(tb);
      const span = 2 + (ce ? 1 : 0) + years.length * 3 + 1;
      GB.printFit(table, 250 + (ce ? 40 : 0), 122, years.length);

      const x = { cfg, ro, ce, years, live, S, span, tb };
      const R = GB.finRows;

      for (const item of cfg.layout) {
        if (item.t === "title") R.titolo(x, item);
        else if (item.t === "spacer") R.spazio(x);
        else if (item.t === "sec") {
          const voci = S.ds.voci.filter((v) => v.sezione === item.id);
          if (!item.noHeader) R.intestazioneSez(x, item);
          voci.forEach((v) => R.voce(x, item, v));
          if (!item.single && !ro) R.aggiungi(x, item);
          if (!item.noTotal)
            tb.append(
              R.totale(
                item.totLabel || "Totale " + item.label,
                item.id,
                "sub",
                cfg,
                live,
                years,
                ce,
                Object.assign({}, item, { sez: true }),
              ),
            );
        } else if (item.t === "row") {
          tb.append(
            R.totale(
              item.label,
              item.key,
              item.cls || "big",
              cfg,
              live,
              years,
              ce,
              item,
            ),
          );
        } else if (item.t === "check") R.check(x, item);
      }
      GB.gridNav(table);
      return { el: wrap, update: () => live.update() };
    },
  };
})();
