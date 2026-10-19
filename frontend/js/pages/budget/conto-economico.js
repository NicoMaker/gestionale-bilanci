/* Conto Economico previsionale e analisi del punto di pareggio: ordine di sezioni, margini, imposte (input) e BEP. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.budget.contoEconomico = function (
    { tb, span, ro, Y, live, B, P },
    { sectionBlock, totalRow, R },
  ) {
    const S = GB.store;
    tb.append(
      h(
        "tr",
        { class: "title" },
        h("td", { colspan: span }, "Conto economico previsionale " + (Y + 1)),
      ),
    );
    sectionBlock("C_RICAVI");
    totalRow(
      "MAGAZZINO RIM. INIZIALI",
      "sub",
      () => B().sezC.C_RIM_INIZ,
      () => B().sez.C_RIM_INIZ,
    );
    sectionBlock("C_ACQUISTI");
    totalRow(
      "MAGAZZINO RIM. FINALI",
      "sub",
      () => B().sezC.C_RIM_FIN,
      () => B().sez.C_RIM_FIN,
    );
    R("COSTO MATERIE PRIME", "costo_mp");
    sectionBlock("C_PRODUTTIVI");
    R("COSTO DEL VENDUTO", "costo_venduto");
    R("1° MARGINE OPERATIVO", "margine1");
    [
      "C_PERSONALE",
      "C_COMMERCIALI",
      "C_AMMINISTRATIVI",
      "C_AMMORTAMENTI",
      "C_ONERI_TRIB",
    ].forEach((id) => sectionBlock(id));
    R("TOTALE COSTI OPERATIVI", "costi_operativi");
    R("EBITDA", "ebitda");
    R("2° MARGINE OPERATIVO (EBIT)", "ebit");
    ["C_ONERI_FIN", "C_PROVENTI_FIN"].forEach((id) => sectionBlock(id));
    R("RISULTATO GESTIONALE", "risultato_gest");
    ["C_RICAVI_EXTRA", "C_COSTI_EXTRA"].forEach((id) => sectionBlock(id));
    R("UTILE ANTE IMPOSTE", "ante_imposte");

    // imposte: consolidato (da C.E.) + input previsione
    {
      const tr = h(
        "tr",
        { class: "line" },
        h("td", { class: "l" }, "IMPOSTE ESERCIZIO"),
        h("td"),
      );
      const c = h("td", { class: "n" });
      live.add(c, (e) => GB.setNum(e, B().C.imposte));
      const inp = GB.numInput(P.imposte_budget || null, {
        readonly: ro,
        cls: "w-yr",
        onCommit: (v) => S.saveParam(Y, "imposte_budget", v === null ? 0 : v),
      });
      inp.dataset.col = "g";
      tr.append(
        c,
        h("td"),
        h("td"),
        h("td"),
        h("td", { class: "n" }, inp),
        h("td"),
        h("td"),
        h(
          "td",
          { class: "no-ro pen-cell" },
          GB.penBtn({
            title: "Modifica imposte",
            onclick: () =>
              GB.editParams({
                title: "Modifica imposte — Budget " + (Y + 1),
                anno: Y,
                campi: [
                  {
                    campo: "imposte_budget",
                    label: "Imposte esercizio (previsione)",
                  },
                ],
              }),
          }),
        ),
      );
      tb.append(tr);
    }
    R("UTILE BILANCIO", "utile", "grand", { nopct: false });

    tb.append(h("tr", { class: "spacer" }, h("td", { colspan: span })));
    tb.append(
      h(
        "tr",
        { class: "title" },
        h("td", { colspan: span }, "Analisi del punto di pareggio (BEP)"),
      ),
    );
    R("TOTALE SPESE FISSE", "spese_fisse", "sub");
    R("TOTALE SPESE VARIABILI", "spese_var", "sub");
    R("COSTO MATERIE PRIME", "costo_mp", "sub");
    R("% PUNTO PAREGGIO AZIENDALE", "bep_pct", "sub", {
      fmt: "pct100",
      nopct: true,
    });
    R("FATTURATO MINIMO PER BEP", "bep_fatturato", "sub", { nopct: true });
    R("GIORNO BEP AZIENDALE", "bep_giorno", "sub", {
      fmt: "int",
      nopct: true,
    });
    R("DATA BEP AZIENDALE", "bep_giorno", "sub", {
      fmt: "date",
      nopct: true,
    });
  };
})();
