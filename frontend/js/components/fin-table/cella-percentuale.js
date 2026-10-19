/* Cella «%» di una riga: valore / denominatore, aggiornata dal motore live. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.finPctCell = function (cfg, live, a, getVal, item) {
    const denOf = (a, item) => cfg.den(a, item);
    return h(
      "td",
      { class: "pc" },
      (() => {
        const td = h("span");
        live.add(td, (e) => {
          const d = denOf(a, item);
          const v = getVal(a);
          e.textContent =
            d && v
              ? fmt.pt(cfg.pctMul ? (v / d) * cfg.pctMul : (v / d) * 100)
              : "";
        });
        return td;
      })(),
    );
  };
})();
