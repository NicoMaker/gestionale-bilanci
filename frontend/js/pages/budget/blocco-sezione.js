/* Blocco di una sezione del C.E.: intestazione, una riga per voce (con variazione manuale inseribile) e totale di sezione. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.budget.bloccoSezione = function (
    { tb, span, ro, Y, live, B, pctCells },
    totalRow,
  ) {
    const S = GB.store;
    const sectionBlock = (id, totKey) => {
      const def = T.SEZIONI.CE.find((s) => s.id === id);
      tb.append(
        h("tr", { class: "sec" }, h("td", { colspan: span }, def.label)),
      );
      S.ds.voci
        .filter((v) => v.sezione === id)
        .forEach((v) => {
          const tr = h("tr", { class: "line" });
          tr.append(
            h(
              "td",
              { class: "l" },
              v.descrizione || h("span", { class: "muted" }, "(senza nome)"),
            ),
          );
          tr.append(
            h(
              "td",
              {
                class: "l",
                style: { fontFamily: "var(--mono)", fontWeight: 700 },
              },
              (v.tipo || "—").toUpperCase(),
            ),
          );
          const c = h("td", { class: "n" }),
            f = h("td", { class: "n" }),
            hh = h("td", { class: "n" });
          const G = S.ds.bvar[v.id] ? S.ds.bvar[v.id][Y] : undefined;
          const g = GB.numInput(G === undefined ? null : G, {
            readonly: ro,
            dec: 4,
            cls: "w-yr",
            onCommit: (val) => S.saveBudgetVar(v.id, Y, val),
          });
          g.dataset.col = "g";
          const row = () => B().righe[v.id] || { C: 0, F: 0, H: 0 };
          const pc = pctCells(
            tr,
            () => row().C,
            () => row().H,
          );
          live.add(c, (e) => GB.setNum(e, row().C));
          live.add(f, (e) => {
            e.textContent = fmt.num(row().F, 4);
          });
          live.add(hh, (e) => GB.setNum(e, row().H));
          pc.bind();
          tr.append(c, pc.d, f, h("td", { class: "n" }, g), hh, pc.i, pc.j);
          tb.append(tr);
        });
      totalRow(
        def.tot,
        "sub",
        () => B().sezC[id],
        () => B().sez[id],
      );
    };
    return sectionBlock;
  };
})();
