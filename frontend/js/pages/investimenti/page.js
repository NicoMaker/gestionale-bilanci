/* Investimenti: incremento di fatturato minimo per coprire un investimento e nuovo budget. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.pages.investimenti = {
    title: "Investimenti",
    icon: "🏗️",
    render(container, ro) {
      const S = GB.store;
      const PT = GB.parts.investimenti;
      const Y = S.anno;
      const live = GB.live();
      const I = () => S.R.inv;
      const P = S.ds.par[Y] || {};
      const mini = PT.mini(live, I);
      const { inp, fatt, fatt1 } = PT.parametri({ ro, Y, live, I });
      const conf = PT.confronto();

      container.append(
        GB.printHead(
          `Investimenti — budget ${Y + 1}`,
          "Incremento di fatturato minimo per coprire i nuovi investimenti",
        ),
        h(
          "div",
          { class: "note no-print" },
          "Incremento di fatturato minimo per coprire nuovi investimenti che hanno effetto sul Conto Economico: Fatturato necessario = (Investimento + Richiesta di aumento utile) / margine sul volume d'affari.",
        ),
        h(
          "div",
          { class: "card" },
          h(
            "div",
            {
              class: "card-b",
              style: {
                display: "flex",
                gap: "30px",
                flexWrap: "wrap",
                alignItems: "center",
              },
            },
            h(
              "div",
              { class: "field", style: { marginBottom: 0 } },
              h("label", null, "Investimento previsto (€)"),
              inp("investimento", P.investimento),
            ),
            h(
              "div",
              { class: "field", style: { marginBottom: 0 } },
              h("label", null, "Richiesta di aumento utile (€)"),
              inp("aumento_utile", P.aumento_utile),
            ),
            h(
              "div",
              { class: "kpi", style: { flex: 1, minWidth: "260px" } },
              h("div", { class: "l" }, "Fatturato necessario"),
              fatt,
              fatt1,
            ),
            ro
              ? null
              : GB.penBtn({
                  title: "Modifica investimento e aumento utile",
                  onclick: () =>
                    GB.editParams({
                      title: `Modifica investimenti — budget ${Y + 1}`,
                      anno: Y,
                      campi: [
                        {
                          campo: "investimento",
                          label: "Investimento previsto (€)",
                        },
                        {
                          campo: "aumento_utile",
                          label: "Richiesta di aumento utile (€)",
                        },
                      ],
                    }),
                }),
            ro
              ? null
              : h(
                  "button",
                  {
                    class: "btn sm no-print",
                    title: "Riporta investimento e aumento utile a zero",
                    onclick: () =>
                      GB.clearParamsFlow(
                        Y,
                        ["investimento", "aumento_utile"],
                        "investimento e richiesta di aumento utile",
                      ),
                  },
                  "Azzera",
                ),
          ),
        ),
        h(
          "div",
          { class: "grid2" },
          mini(`Budget ${Y + 1}`, [
            ["Ricavi", "ricavi", "d_ricavi", "line"],
            [
              "Costi variabili (materie prime + spese variabili)",
              "costi_var",
              "d_var",
              "line",
            ],
            [
              "Differenza (volume d'affari − costi variabili)",
              "differenza",
              "d_diff",
              "sub",
            ],
            ["Costi fissi", "costi_fissi", "d_fissi", "line"],
            ["Utile", "utile", "d_utile", "big"],
          ]),
          mini("Nuovo budget considerando l'investimento", [
            ["Ricavi", "n_ricavi", "n_d_ricavi", "line"],
            ["Costi variabili", "n_costi_var", "n_d_var", "line"],
            [
              "Differenza (volume d'affari − costi variabili)",
              "n_differenza",
              "n_d_diff",
              "sub",
            ],
            [
              "Costi fissi + investimento",
              "n_costi_fissi",
              "n_d_fissi",
              "line",
            ],
            ["Utile", "n_utile", "n_d_utile", "big"],
          ]),
        ),
        conf.multi.el,
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Utile e fatturato necessario per esercizio"),
          ),
          conf.mChart,
        ),
      );
      return {
        update: () => {
          live.update();
          conf.multi.update();
          conf.drawMulti();
        },
      };
    },
  };
})();
