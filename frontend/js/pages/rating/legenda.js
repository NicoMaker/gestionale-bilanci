/* Legenda delle classi di rating (AAA … CCC) in una riga sopra la tabella. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.rating.legenda = function () {
    return h(
      "div",
      { class: "legend-line" },
      h("span", { class: "muted" }, "Legenda rating: "),
      Object.entries(window.Calc.RATING_LABEL).map(([k, v]) =>
        h(
          "span",
          { class: "lg" },
          h("b", null, k),
          " " +
            String(v)
              .replace(/^Rischio /, "")
              .toLowerCase(),
        ),
      ),
    );
  };
})();
