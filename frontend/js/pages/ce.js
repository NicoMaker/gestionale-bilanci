(function () {
  const GB = window.GB;
  const { h } = GB;
  const T = window.Template;

  GB.pages.ce = {
    title: "Conto Economico",
    icon: "📈",
    render(container, ro) {
      const S = GB.store;
      const years = S.R.tutti; // tutti gli esercizi in colonna (si scorre in orizzontale)
      container.classList.add("fit");
      const sec = (id, extra) => {
        const d = T.SEZIONI.CE.find((s) => s.id === id);
        return Object.assign(
          { t: "sec", id, label: d.label, totLabel: d.tot, single: d.single },
          extra,
        );
      };
      const row = (label, key, cls, extra) =>
        Object.assign({ t: "row", label, key, cls }, extra);
      const layout = [
        { t: "title", label: "Ricavi e Costi" },
        sec("C_RICAVI"),
        row("PRODOTTO INTERNO LORDO", "pil", "big"),
        sec("C_RIM_INIZ"),
        sec("C_ACQUISTI"),
        sec("C_RIM_FIN"),
        row("COSTO MATERIE PRIME", "costo_mp", "big"),
        sec("C_PRODUTTIVI"),
        row("COSTO DEL VENDUTO", "costo_venduto", "big"),
        row("I MARGINE OPERATIVO", "margine1", "big"),
        sec("C_PERSONALE"),
        sec("C_COMMERCIALI"),
        sec("C_AMMINISTRATIVI"),
        sec("C_AMMORTAMENTI"),
        sec("C_ONERI_TRIB"),
        row("TOTALE COSTI OPERATIVI", "costi_operativi", "big"),
        row("EBITDA", "ebitda", "big"),
        row("EBIT", "ebit", "big"),
        sec("C_ONERI_FIN"),
        sec("C_PROVENTI_FIN"),
        row("RISULTATO GESTIONALE", "risultato_gest", "big"),
        sec("C_RICAVI_EXTRA"),
        sec("C_COSTI_EXTRA"),
        row("UTILE ANTE IMPOSTE", "ante_imposte", "big"),
        sec("C_IMPOSTE", { noHeader: true, noTotal: true, single: true }),
        row("UTILE BILANCIO", "utile", "grand"),
        { t: "spacer" },
        { t: "title", label: "Analisi del punto di pareggio (BEP)" },
        row("TOTALE SPESE FISSE", "spese_fisse", "sub"),
        row("TOTALE SPESE VARIABILI", "spese_var", "sub"),
        row("COSTO MATERIE PRIME", "costo_mp", "sub"),
        row("% PUNTO PAREGGIO AZIENDALE", "bep_pct", "sub", {
          fmt: "pct100",
          nopct: true,
        }),
        row("FATTURATO MINIMO PER BEP", "bep_fatturato", "sub", {
          nopct: true,
        }),
        row("GIORNO BEP AZIENDALE", "bep_giorno", "sub", {
          fmt: "int",
          nopct: true,
        }),
        row("DATA BEP AZIENDALE", "bep_giorno", "sub", {
          fmt: "date",
          nopct: true,
        }),
      ];
      const tbl = GB.fin.build(
        {
          ambito: "CE",
          years,
          layout,
          getY: (a) => S.R.anni[a].ce,
          den: (a) => S.R.anni[a].ce.ricavi,
        },
        ro,
      );
      container.append(
        GB.printHead(
          "Conto Economico riclassificato",
          "Esercizi " + years.join(" · "),
        ),
        h(
          "div",
          { class: "note no-print" },
          h("b", null, "Tipo riga: "),
          "IP inflazione + produttività · I inflazione · P produttività · O come anno precedente · Z azzerato · V spesa variabile · F spesa fissa. ",
          "Il tipo guida il Budget e il calcolo del punto di pareggio (spese fisse = tipo F, spese variabili = tipo V). Scorri a destra per vedere tutti gli anni: codice e descrizione restano fissi.",
        ),
        ro
          ? ""
          : h(
              "div",
              { class: "no-print", style: { marginBottom: "12px" } },
              GB.addAnnoBtn(),
            ),
        tbl.el,
      );
      return { update: tbl.update };
    },
  };
})();
