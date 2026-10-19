/* Riga calcolata (saldo, totale entrate/uscite, liquidità): 12 mesi + totale, aggiornata dal motore live. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.cashflow.rigaCalcolata = function ({ tb, live }) {
    const calcRow = (label, cls, fn, withTot) => {
      const tr = h("tr", { class: cls }, h("td", { class: "l" }, label));
      for (let m = 0; m < 12; m++) {
        const c = h("td", { class: "n" });
        tr.append(c);
        live.add(c, (e) => GB.setNum(e, fn(m)));
      }
      const t = h("td", { class: "n" });
      tr.append(t);
      if (withTot)
        live.add(t, (e) =>
          GB.setNum(
            e,
            Array.from({ length: 12 }, (_, m) => fn(m)).reduce(
              (s, x) => s + x,
              0,
            ),
          ),
        );
      tr.append(h("td", { class: "no-ro" }));
      tb.append(tr);
    };
    return calcRow;
  };
})();
