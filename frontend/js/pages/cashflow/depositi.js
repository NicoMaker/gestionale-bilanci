/* Depositi bancari: saldo iniziale di gennaio (inseribile) e riporto mensile + riga «A SALDO BANCA». */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.cashflow.depositi = function ({
    tb,
    ro,
    Y,
    live,
    CF,
    title,
    calcRow,
  }) {
    const S = GB.store;
    title("DEPOSITI BANCARI");
    {
      const P = S.ds.par[Y] || {};
      const tr = h(
        "tr",
        { class: "line" },
        h("td", { class: "l" }, "Banca — saldo iniziale (gennaio) e riporto"),
      );
      for (let m = 0; m < 12; m++) {
        if (m === 0) {
          const inp = GB.numInput(P.saldo_iniziale_cf || null, {
            readonly: ro,
            cls: "w-mo",
            onCommit: (v) =>
              S.saveParam(Y, "saldo_iniziale_cf", v === null ? 0 : v),
          });
          inp.dataset.col = "m0";
          tr.append(h("td", { class: "n" }, inp));
        } else {
          const c = h("td", { class: "n" });
          tr.append(c);
          live.add(c, (e) => GB.setNum(e, CF().saldo[m]));
        }
      }
      tr.append(
        h("td"),
        h(
          "td",
          { class: "no-ro pen-cell" },
          GB.penBtn({
            title: "Modifica saldo iniziale",
            onclick: () =>
              GB.editParams({
                title: "Modifica saldo banca — Cash Flow " + (Y + 1),
                intro:
                  "Il saldo di gennaio è il saldo iniziale; dagli altri mesi il saldo è la liquidità del mese precedente.",
                anno: Y,
                campi: [
                  { campo: "saldo_iniziale_cf", label: "Saldo iniziale (gennaio)" },
                ],
              }),
          }),
        ),
      );
      tb.append(tr);
    }
    calcRow("A  SALDO BANCA", "sub", (m) => CF().saldo[m], false);
  };
})();
