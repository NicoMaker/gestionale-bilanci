/* Azione «Allinea risultato d'esercizio»: copia l'utile del C.E. nella riga del Patrimonio Netto. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.sp.allinea = function (years) {
    const S = GB.store;
    const v = S.ds.voci.find(
      (x) => x.sezione === "P_PN" && /^RISULTATO/i.test(x.descrizione || ""),
    );
    if (!v) {
      GB.toast(
        "Nessuna riga “RISULTATO D'ESERCIZIO” nel Patrimonio Netto",
        "err",
      );
      return;
    }
    years.forEach((a) =>
      S.saveValore(v.id, a, Math.round(S.R.anni[a].ce.utile * 100) / 100),
    );
    S.emit("structure");
    GB.toast("Risultato d'esercizio allineato all'utile del Conto Economico");
  };
})();
