/* Legenda delle classi di rating (AAA … CCC) in una riga sopra la tabella. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.rating.legenda = function () {
    return h(
      "div",
      { class: "legend-line legend-chips" },
      h("span", { class: "muted" }, "Classi di rating: "),
      Object.entries(window.Calc.RATING_LABEL).map(([k, v]) =>
        h(
          "span",
          { class: "lg lg-chip r-" + k },
          h("b", null, k),
          h(
            "span",
            null,
            String(v)
              .replace(/^Rischio /, "")
              .toLowerCase(),
          ),
        ),
      ),
    );
  };
})();
