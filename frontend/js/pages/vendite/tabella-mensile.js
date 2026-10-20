/* Tabella delle vendite: pesi per esercizio, 12 mesi (ricavi inseribili, fattore medio, stagionalità %, progressiva %) e totali. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.vendite = {};

  GB.parts.vendite.tabella = function ({ years, ro, live, V }) {
    const S = GB.store;
    const ctx = GB.sel.mesi({ key: "vendite", years });
    const azzeraAnno = async (a) => {
      if (
        await GB.confirm(
          `Azzerare tutte le vendite dell'esercizio ${a}?`,
          "Azzera",
        )
      )
        S.clearVendite({ anni: [a] })
          .then(() => GB.toast("Vendite azzerate"))
          .catch(() => {});
    };
    const table = h("table", { class: "fin" });
    table.append(
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h("th", { class: "l" }, ""),
          years.map((a) =>
            h(
              "th",
              null,
              "ES. " + a,
              h(
                "button",
                {
                  class: "xbtn no-ro no-print",
                  title: `Azzera le vendite dell'esercizio ${a}`,
                  onclick: () => azzeraAnno(a),
                },
                "✕",
              ),
            ),
          ),
          h("th", null, "FT. MEDIO"),
          h("th", null, "STAGIO. %"),
          h("th", null, "PROGRESS. %"),
          h("th", { class: "no-ro" }),
        ),
      ),
    );
    const tb = h("tbody");
    table.append(tb);

    // pesi
    const pr = h(
      "tr",
      { class: "sec" },
      h("td", { class: "l" }, "peso (media ponderata)"),
    );
    years.forEach((a, i) => {
      const cur = S.ds.par[a] ? S.ds.par[a].peso_vendite : 1;
      const inp = GB.numInput(cur, {
        readonly: ro,
        dec: 2,
        cls: "w-yr",
        onCommit: (v) => S.saveParam(a, "peso_vendite", v),
      });
      inp.dataset.col = "peso" + i;
      pr.append(h("td", { class: "n" }, inp));
    });
    const sw = h("td", { class: "n" });
    live.add(sw, (e) => {
      e.textContent = fmt.num(V().somma_pesi, 2);
    });
    pr.append(
      sw,
      h("td"),
      h("td"),
      h(
        "td",
        { class: "no-ro pen-cell" },
        GB.penBtn({
          title: "Modifica i pesi",
          onclick: () =>
            GB.editParamAnni({
              title: "Modifica peso delle vendite (media ponderata)",
              campo: "peso_vendite",
              dec: 2,
              years,
            }),
        }),
      ),
    );
    tb.append(pr);

    T.MESI_BREVI.forEach((mn, m) => {
      const tr = h(
        "tr",
        { class: "line" },
        h("td", { class: "l", style: { fontWeight: 600 } }, mn),
      );
      years.forEach((a, i) => {
        const cur = S.ds.vend[a] ? S.ds.vend[a][m] : 0;
        const inp = GB.numInput(cur || null, {
          readonly: ro,
          cls: "w-yr",
          onCommit: (v) => S.saveVendita(a, m + 1, v),
        });
        inp.dataset.col = "v" + i;
        tr.append(h("td", { class: "n" }, inp));
      });
      const ft = h("td", { class: "n" }),
        st = h("td", { class: "n" }),
        pg = h("td", { class: "n" });
      live.add(ft, (e) => GB.setNum(e, V().ft[m]));
      live.add(st, (e) => {
        e.textContent = fmt.num(V().stag[m], 4);
      });
      live.add(pg, (e) => {
        e.textContent = fmt.num(V().prog[m], 4);
      });
      tr.append(
        ft,
        st,
        pg,
        h(
          "td",
          { class: "no-ro pen-cell" },
          GB.sel.box(ctx, m + 1),
          GB.penBtn({
            title: "Modifica " + mn,
            onclick: () => GB.editMeseVendite(m, years),
          }),
          h(
            "button",
            {
              class: "xbtn",
              title: "Azzera " + mn,
              onclick: () => ctx.azzera([m + 1]),
            },
            "✕",
          ),
        ),
      );
      tb.append(tr);
    });
    const tot = h("tr", { class: "grand" }, h("td", { class: "l" }, "TOT"));
    years.forEach((a, i) => {
      const c = h("td", { class: "n" });
      tot.append(c);
      live.add(c, (e) => {
        e.textContent = fmt.num(V().tot[i]);
      });
    });
    const t1 = h("td", { class: "n" }),
      t2 = h("td", { class: "n" });
    live.add(t1, (e) => {
      e.textContent = fmt.num(V().ft_tot);
    });
    live.add(t2, (e) => {
      e.textContent = fmt.num(V().stag_tot, 4);
    });
    tot.append(t1, t2, h("td"), h("td", { class: "no-ro" }));
    tb.append(tot);
    GB.gridNav(table);
    return table;
  };
})();
