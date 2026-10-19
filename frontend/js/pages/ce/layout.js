/* Struttura del Conto Economico riclassificato: sezioni (voci inseribili) e righe di totale/margine/BEP. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const T = window.Template;

  GB.parts.ce = {
    layout() {
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
      return layout;
    },
  };
})();
