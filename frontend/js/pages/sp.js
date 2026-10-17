(function () {
  const GB = window.GB;
  const { h } = GB;
  const T = window.Template;

  GB.pages.sp = {
    title: "Stato Patrimoniale",
    icon: "🏛️",
    render(container, ro) {
      const S = GB.store;
      const years = S.R.tutti; // tutti gli esercizi in colonna (si scorre in orizzontale)
      container.classList.add("fit");
      const sec = (id) => { const d = T.SEZIONI.SP.find((s) => s.id === id); return { t: "sec", id, label: d.label, totLabel: d.tot, side: d.lato }; };
      const row = (label, key, cls, side) => ({ t: "row", label, key, cls, side });
      const layout = [
        { t: "title", label: "ATTIVO" },
        sec("A_IMM_IMM"), sec("A_IMM_MAT"), sec("A_IMM_FIN"),
        row("ATTIVO FISSO NETTO (ATTIVO IMMOBILIZZATO NETTO)", "attivo_fisso", "big", "A"),
        sec("A_RIMANENZE"), sec("A_CRED_ENTRO"), sec("A_CRED_OLTRE"),
        row("Totale Crediti", "tot_crediti", "sub", "A"),
        row("LIQUIDITA' DIFFERITE", "liq_differite", "sub", "A"),
        sec("A_LIQUIDITA"), sec("A_RISCONTI"),
        row("ATTIVO CIRCOLANTE (ATTIVO CORRENTE)", "attivo_circolante", "big", "A"),
        row("TOTALE ATTIVITA'", "totale_attivo", "grand", "A"),
        { t: "spacer" },
        { t: "title", label: "PASSIVO" },
        sec("P_PN"), sec("P_CONS_VARIE"), sec("P_FINANZ"),
        row("Totale Passività Consolidate", "tot_pass_cons", "sub", "P"),
        row("TOTALE CONSOLIDATO", "tot_consolidato", "big", "P"),
        sec("P_BANCHE"), sec("P_CORR_VARIE"),
        row("Totale Passività Correnti", "tot_pass_correnti", "sub", "P"),
        row("TOTALE PASSIVITA'", "totale_passivita", "grand", "P"),
        { t: "check", label: "Check = 0  (Totale passività − Totale attività)", key: "check" },
      ];
      const tbl = GB.fin.build({
        ambito: "SP", years, layout,
        getY: (a) => S.R.anni[a].sp,
        den: (a, item) => (item.side === "A" ? S.R.anni[a].sp.totale_attivo : S.R.anni[a].sp.totale_passivita),
      }, ro);

      const allinea = () => {
        const v = S.ds.voci.find((x) => x.sezione === "P_PN" && /^RISULTATO/i.test(x.descrizione || ""));
        if (!v) { GB.toast("Nessuna riga “RISULTATO D'ESERCIZIO” nel Patrimonio Netto", "err"); return; }
        years.forEach((a) => S.saveValore(v.id, a, Math.round(S.R.anni[a].ce.utile * 100) / 100));
        S.emit("structure");
        GB.toast("Risultato d'esercizio allineato all'utile del Conto Economico");
      };
      container.append(
        GB.printHead("Stato Patrimoniale riclassificato", "Esercizi " + years.join(" · ")),
        h("div", { class: "note no-print" }, "Inserisci gli importi per ciascun esercizio: scorri a destra per vedere tutti gli anni (codice e descrizione restano fissi). I fondi ammortamento vanno inseriti con segno negativo. I totali, le percentuali e il Check = 0 si aggiornano automaticamente."),
        ro ? "" : h("div", { class: "no-print", style: { marginBottom: "12px", display: "flex", gap: "8px", flexWrap: "wrap" } },
          h("button", { class: "btn sm", onclick: allinea }, "↤ Allinea “Risultato d'esercizio” all'utile del C.E."), GB.addAnnoBtn()),
        tbl.el
      );
      return { update: tbl.update };
    },
  };
})();
