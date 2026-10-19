/* Struttura dello Stato Patrimoniale riclassificato: Attivo, Passivo e riga di controllo. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const T = window.Template;

  GB.parts.sp = {
    layout() {
      const sec = (id) => {
        const d = T.SEZIONI.SP.find((s) => s.id === id);
        return { t: "sec", id, label: d.label, totLabel: d.tot, side: d.lato };
      };
      const row = (label, key, cls, side) => ({
        t: "row",
        label,
        key,
        cls,
        side,
      });
      const layout = [
        { t: "title", label: "ATTIVO" },
        sec("A_IMM_IMM"),
        sec("A_IMM_MAT"),
        sec("A_IMM_FIN"),
        row(
          "ATTIVO FISSO NETTO (ATTIVO IMMOBILIZZATO NETTO)",
          "attivo_fisso",
          "big",
          "A",
        ),
        sec("A_RIMANENZE"),
        sec("A_CRED_ENTRO"),
        sec("A_CRED_OLTRE"),
        row("Totale Crediti", "tot_crediti", "sub", "A"),
        row("LIQUIDITA' DIFFERITE", "liq_differite", "sub", "A"),
        sec("A_LIQUIDITA"),
        sec("A_RISCONTI"),
        row(
          "ATTIVO CIRCOLANTE (ATTIVO CORRENTE)",
          "attivo_circolante",
          "big",
          "A",
        ),
        row("TOTALE ATTIVITA'", "totale_attivo", "grand", "A"),
        { t: "spacer" },
        { t: "title", label: "PASSIVO" },
        sec("P_PN"),
        sec("P_CONS_VARIE"),
        sec("P_FINANZ"),
        row("Totale Passività Consolidate", "tot_pass_cons", "sub", "P"),
        row("TOTALE CONSOLIDATO", "tot_consolidato", "big", "P"),
        sec("P_BANCHE"),
        sec("P_CORR_VARIE"),
        row("Totale Passività Correnti", "tot_pass_correnti", "sub", "P"),
        row("TOTALE PASSIVITA'", "totale_passivita", "grand", "P"),
        {
          t: "check",
          label: "Check = 0  (Totale passività − Totale attività)",
          key: "check",
        },
      ];
      return layout;
    },
  };
})();
