/* Confronto di tutti gli esercizi: riepilogo annuale del piano di tesoreria e liquidità mese per mese. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.cashflow.confronto = function () {
    const sum = (a) => a.reduce((s, x) => s + x, 0);
    const mrow = (label, get, cls, kind) => ({
      label,
      get,
      cls: cls || "line",
      kind: kind || "num",
    });
    const minIdx = (a) => a.reduce((bi, x, i) => (x < a[bi] ? i : bi), 0);
    const multi = GB.multiTable({
      title: "Cash flow di tutti gli esercizi",
      hint: "clicca un esercizio per aprirlo e modificarne i valori",
      first: "Piano di tesoreria",
      head: (e) => `Cash flow ${e.anno + 1}`,
      sub: (e) => "base " + e.anno,
      rows: [
        { t: "sec", label: "Riepilogo annuale" },
        mrow("Saldo iniziale banca (gennaio)", (e) => e.cf.saldo[0]),
        mrow("Totale entrate", (e) => sum(e.cf.entrate), "line"),
        mrow("Totale uscite", (e) => sum(e.cf.uscite), "line"),
        mrow(
          "Variazione netta (entrate + uscite)",
          (e) => sum(e.cf.entrate) + sum(e.cf.uscite),
          "sub",
        ),
        mrow("Liquidità a fine anno", (e) => e.cf.liq[11], "big"),
        mrow("Liquidità minima", (e) => Math.min(...e.cf.liq), "line"),
        mrow(
          "Mese con liquidità minima",
          (e) =>
            e.cf.liq.every((x) => x === 0) ? "" : T.MESI[minIdx(e.cf.liq)],
          "line",
          "text",
        ),
        { t: "sec", label: "Liquidità banca a fine mese" },
        ...T.MESI.map((mn, m) =>
          mrow(mn, (e) => e.cf.liq[m], m === 11 ? "sub" : "line"),
        ),
      ],
    });
    const mChart = h("div", { class: "card-b" });
    const drawMulti = () =>
      mChart.replaceChildren(
        GB.yearLines({
          labels: T.MESI.map((m) => m.slice(0, 3)),
          series: {
            name: (e) => `Cash flow ${e.anno + 1}`,
            values: (e) => e.cf.liq,
          },
          height: 280,
        }),
      );
    drawMulti();
    return { multi, mChart, drawMulti };
  };
})();
