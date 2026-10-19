/* Riga di una voce di conto: codice, descrizione, tipo (solo C.E.), importi per anno con % e pulsante di eliminazione. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.finRows = GB.finRows || {};

  GB.finRows.voce = function (x, item, v) {
    const { cfg, ro, ce, years, live, S, span, tb } = x;
    const pctCell = (a, getVal, it) => GB.finPctCell(cfg, live, a, getVal, it);
    const tr = h("tr", { class: "line" });
    tr.append(
      h(
        "td",
        { class: "l stk1" },
        h("input", {
          class: "ci cod",
          "data-col": "cod",
          value: v.codice || "",
          placeholder: "cod.",
          readonly: ro || null,
          onchange: (e) => S.updateVoce(v.id, { codice: e.target.value }),
        }),
      ),
    );
    tr.append(
      h(
        "td",
        { class: "l stk2" },
        h("input", {
          class: "ci desc",
          "data-col": "desc",
          "data-voce": v.id,
          value: v.descrizione || "",
          placeholder: "descrizione…",
          readonly: ro || null,
          onchange: (e) => S.updateVoce(v.id, { descrizione: e.target.value }),
        }),
      ),
    );
    if (ce) {
      if (item.id === "C_IMPOSTE") tr.append(h("td"));
      else if (ro) tr.append(h("td", { class: "l" }, v.tipo || ""));
      else {
        const sel = h(
          "select",
          {
            class: "ci",
            title: "Tipo riga (usato in Budget e Punto di pareggio)",
            onchange: (e) => S.updateVoce(v.id, { tipo: e.target.value }),
          },
          [h("option", { value: "" }, "—")].concat(
            window.Template.TIPI.map((t) =>
              h("option", { value: t.v, title: t.d }, t.v),
            ),
          ),
        );
        sel.value = (v.tipo || "").toUpperCase();
        tr.append(h("td", { class: "l" }, sel));
      }
    }
    years.forEach((a, yi) => {
      const cur = S.ds.val[v.id] ? S.ds.val[v.id][a] : undefined;
      const inp = GB.numInput(cur === undefined ? null : cur, {
        readonly: ro,
        cls: "w-yr",
        onCommit: (val) => S.saveValore(v.id, a, val),
      });
      inp.dataset.col = "y" + yi;
      tr.append(h("td", { class: "gap" }), h("td", { class: "n" }, inp));
      tr.append(
        pctCell(
          a,
          (yy) => (S.ds.val[v.id] ? S.ds.val[v.id][yy] || 0 : 0),
          item,
        ),
      );
    });
    tr.append(
      h(
        "td",
        { class: "no-ro pen-cell" },
        GB.penBtn({
          title: "Modifica riga",
          onclick: () =>
            GB.editVoce(v, { tipo: ce && item.id !== "C_IMPOSTE", years }),
        }),
        v.fissa
          ? ""
          : h(
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
  };
})();
