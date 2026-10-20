/* Eliminazione di un anno con verifica dei dati (conferma esplicita se contiene dati). */
(function () {
  const GB = window.GB;
  const { h } = GB;

  /* ── eliminazione anno con verifica dei dati ── */
  async function eliminaAnno(anno) {
    const S = GB.store;
    if (anno === undefined) anno = S.anno;
    if (S.anni.length <= 1) {
      GB.toast("Il cliente deve avere almeno un anno", "err");
      return;
    }
    let d;
    try {
      d = await GB.api.get(`/clienti/${S.clienteId}/anni/${anno}/dati`);
    } catch (e) {
      GB.toast(e.message, "err");
      return;
    }
    if (!d.ha_dati) {
      if (
        await GB.confirm(
          `L'anno ${anno} non contiene dati. Rimuoverlo dall'elenco? (finisce nel cestino per 15 giorni)`,
          "Rimuovi",
        )
      )
        S.deleteAnno(anno, false).catch(() => {});
      return;
    }
    const body = h(
      "div",
      null,
      h(
        "p",
        null,
        `⚠️ L'anno ${anno} contiene ${d.totale} dati inseriti (bilancio, vendite, budget, cash flow). Verrà spostato nel cestino e potrai ripristinarlo entro 15 giorni:`,
      ),
      GB.riepilogoDati(d),
      h(
        "p",
        { class: "small muted" },
        "Passati 15 giorni l'esercizio viene eliminato definitivamente.",
      ),
    );
    const r = await GB.modal({
      title: `Elimina l'anno ${anno}`,
      body,
      buttons: [
        { label: "Annulla", value: false },
        { label: "Sposta nel cestino", kind: "danger", value: true },
      ],
    });
    if (r) S.deleteAnno(anno, true).catch(() => {});
  }
  GB.eliminaAnno = eliminaAnno; // usata anche dalle intestazioni delle colonne anno (SP / CE)
})();
