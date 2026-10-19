/* Parametri del budget: inflazione (i), produttività (p) e legenda dei tipi riga. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.budget = {};

  GB.parts.budget.parametri = function ({ ro, Y }) {
    const S = GB.store;
    const P = S.ds.par[Y] || {};
    const pInp = (campo, val) =>
      GB.numInput(val || 0, {
        readonly: ro,
        dec: 2,
        cls: "w-mo",
        onCommit: (v) => S.saveParam(Y, campo, v === null ? 0 : v),
      });
    const legend = h(
      "div",
      { class: "card" },
      h(
        "div",
        { class: "card-h" },
        h("h3", null, `Parametri del budget ${Y + 1}`),
        ro
          ? null
          : GB.penBtn({
              title: "Modifica i parametri",
              onclick: () =>
                GB.editParams({
                  title: `Modifica parametri del budget ${Y + 1}`,
                  anno: Y,
                  campi: [
                    {
                      campo: "inflazione",
                      label: "i · Inflazione prevista (%)",
                    },
                    {
                      campo: "produttivita",
                      label: "p · Maggior produttività prevista (%)",
                    },
                  ],
                }),
            }),
      ),
      h(
        "div",
        { class: "card-b" },
        h(
          "div",
          {
            style: {
              display: "flex",
              gap: "28px",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "12px",
            },
          },
          h(
            "div",
            null,
            h("b", null, "i"),
            " : Inflazione prevista (%) ",
            pInp("inflazione", P.inflazione),
          ),
          h(
            "div",
            null,
            h("b", null, "p"),
            " : Maggior produttività prevista (%) ",
            pInp("produttivita", P.produttivita),
          ),
          h(
            "div",
            { class: "muted" },
            h("b", null, "o"),
            " : valore come anno precedente = 1",
          ),
          h(
            "div",
            { class: "muted" },
            h("b", null, "z"),
            " : valore azzerato = 0",
          ),
        ),
        h(
          "div",
          { class: "small muted" },
          h("b", null, "Ripartizione valori per tipo → "),
          "I, F: 1 + i · P: 1 + p · IP, V: (1 + i)(1 + p) · O: 1 · Z: 0. ",
          h("b", null, "Variazioni manuali → "),
          "vuoto = applica il fattore del tipo · numero con decimali (es. 1,10 o 0,95) = moltiplicatore del valore consolidato · numero intero (es. 5000 o −2000) = importo sommato al consolidato.",
        ),
      ),
    );
    return { P, legend };
  };
})();
