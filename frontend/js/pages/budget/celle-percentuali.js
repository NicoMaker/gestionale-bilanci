/* Celle «%» del budget: incidenza sui ricavi del consolidato e della previsione, e differenza in punti. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.budget.pctCells = function ({ live, B }) {
    const pctCells = (tr, getC, getH, cls) => {
      const d = h("td", { class: "pc" }),
        i = h("td", { class: "pc" }),
        j = h("td", { class: "pc" });
      return {
        d,
        i,
        j,
        bind() {
          live.add(d, (e) => {
            const r = B().C.ricavi;
            const v = getC();
            e.textContent = r && v ? fmt.pt((v / r) * 100) : "";
          });
          live.add(i, (e) => {
            const r = B().H.ricavi;
            const v = getH();
            e.textContent = r && v ? fmt.pt((v / r) * 100) : "";
          });
          live.add(j, (e) => {
            const rc = B().C.ricavi,
              rh = B().H.ricavi;
            const vc = getC(),
              vh = getH();
            const dd = rc ? ((vc || 0) / rc) * 100 : 0,
              ii = rh ? ((vh || 0) / rh) * 100 : 0;
            e.textContent = (vc || vh) && (rc || rh) ? fmt.pt(ii - dd) : "";
          });
        },
      };
    };
    return pctCells;
  };
})();
