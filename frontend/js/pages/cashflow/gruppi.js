/* Gruppi di voci (entrate «E» / uscite «U»): descrizione modificabile, 12 mesi inseribili, totale riga, elimina e «+ aggiungi voce». */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.cashflow.gruppi = function ({ tb, ro, Y, live, CF, span }) {
    const S = GB.store;
    const ctx = GB.sel.voci({
      key: "cf-" + Y,
      ambiti: ["CF"],
      cosa: "cashflow",
      anno: Y,
    });
    const gruppi = (dir) => {
      T.SEZIONI.CF.filter((g) => g.dir === dir).forEach((g) => {
        const righe = S.ds.voci.filter((v) => v.sezione === g.id);
        tb.append(
          h(
            "tr",
            { class: "sec" },
            h(
              "td",
              { colspan: span },
              h(
                "span",
                { class: "stk-label" },
                g.label,
                ro
                  ? null
                  : GB.sel.sezione(ctx, {
                      label: g.label,
                      ids: righe.map((v) => v.id),
                    }),
              ),
            ),
          ),
        );
        righe.forEach((v) => {
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
              Array.from({ length: 12 }, (_, m) => CF().cfv(v.id, m)).reduce(
                (s, x) => s + x,
                0,
              ),
            ),
          );
          tr.append(
            t,
            h(
              "td",
              { class: "no-ro pen-cell" },
              GB.sel.box(ctx, v.id),
              GB.penBtn({
                title: "Modifica riga",
                onclick: () => GB.editVoceCashflow(v, Y),
              }),
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
    return gruppi;
  };
})();
