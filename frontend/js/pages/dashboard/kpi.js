/* Schede KPI del cliente: ricavi, EBITDA, EBIT, utile, rating, current ratio, budget e BEP. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.dashboard = {};

  GB.parts.dashboard.kpi = function (S, Y) {
    const cur = S.R.anni[Y];
    const bud = S.R.bud;
    const kpi = (l, v, s) =>
      h(
        "div",
        { class: "kpi" },
        h("div", { class: "l" }, l),
        h("div", { class: "v" }, v),
        s ? h("div", { class: "s" }, s) : null,
      );
    const prev = S.R.anni[Y - 1];
    const delta = (a, b) =>
      b
        ? (a - b >= 0 ? "▲ " : "▼ ") +
          fmt.pct(Math.abs((a - b) / Math.abs(b)), 1) +
          " vs " +
          (Y - 1)
        : "";
    const kpis = h(
      "div",
      { class: "kpis" },
      kpi(
        `Ricavi ${Y}`,
        fmt.eur(cur.ce.ricavi),
        delta(cur.ce.ricavi, prev.ce.ricavi),
      ),
      kpi(
        "EBITDA",
        fmt.eur(cur.ce.ebitda),
        cur.ce.ricavi
          ? fmt.pct(cur.ce.ebitda / cur.ce.ricavi) + " dei ricavi"
          : "",
      ),
      kpi(
        "EBIT",
        fmt.eur(cur.ce.ebit),
        cur.ind.ros != null ? "ROS " + fmt.pct(cur.ind.ros) : "",
      ),
      kpi(
        "Utile di bilancio",
        fmt.eur(cur.ce.utile),
        cur.ind.roe != null ? "ROE " + fmt.pct(cur.ind.roe) : "",
      ),
      kpi(
        "Rating",
        cur.rating.rating || "n.d.",
        cur.rating.rating
          ? cur.rating.rating_desc +
              " · punteggio " +
              cur.rating.punteggio +
              "/12"
          : cur.rating.vuoto
            ? "nessun dato"
            : "punteggio " + cur.rating.punteggio + "/12",
      ),
      kpi(
        "Current ratio",
        cur.ind.current_ratio == null
          ? "n.d."
          : fmt.num(cur.ind.current_ratio, 2),
        "Attivo circolante / Passività correnti",
      ),
      kpi(
        `Budget ${Y + 1} · ricavi`,
        fmt.eur(bud.H.ricavi),
        `EBIT ${fmt.eur(bud.H.ebit)} · utile ${fmt.eur(bud.H.utile)}`,
      ),
      kpi(
        "Pareggio (BEP) budget",
        fmt.eur(bud.H.bep_fatturato),
        bud.H.bep_pct != null ? fmt.pt(bud.H.bep_pct) + " % del fatturato" : "",
      ),
    );
    return kpis;
  };
})();
