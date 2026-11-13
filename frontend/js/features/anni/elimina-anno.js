/* Eliminazione di uno o più anni con verifica dei dati (conferma esplicita se contengono dati). */
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

  /* ── eliminazione di più anni selezionati (caselle nelle intestazioni di S.P. e C.E.) ──
     Restituisce true se gli anni sono stati eliminati. Senza dati: conferma semplice; se qualche anno contiene dati
     mostra cosa si perde. Tutto nel cestino per 15 giorni. */
  async function eliminaAnni(anni) {
    const S = GB.store;
    anni = [...new Set(anni)].sort((a, b) => a - b);
    if (!anni.length) return false;
    if (anni.length === 1) {
      await eliminaAnno(anni[0]);
      return true;
    }
    if (anni.length >= S.anni.length) {
      GB.toast(
        "Il cliente deve avere almeno un anno: lasciane almeno uno non selezionato",
        "err",
      );
      return false;
    }
    let prev;
    try {
      prev = await GB.api.post(`/clienti/${S.clienteId}/anni/elimina-multiplo`, {
        anni,
        anteprima: true,
      });
    } catch (e) {
      GB.toast(e.message, "err");
      return false;
    }
    const elenco = h(
      "p",
      { class: "small" },
      "Esercizi: ",
      h("strong", null, anni.join(", ")),
    );
    const conDati = prev.con_dati.length > 0;
    const body = conDati
      ? h(
          "div",
          null,
          h(
            "p",
            null,
            `⚠️ ${prev.con_dati.length} su ${anni.length} esercizi contengono dati inseriti (bilancio, vendite, budget, cash flow). Verranno spostati nel cestino e potrai ripristinarli entro 15 giorni:`,
          ),
          elenco,
          GB.riepilogoDati({ anni: prev.con_dati.map((x) => x.dati) }),
          prev.senza_dati
            ? h(
                "p",
                { class: "small muted" },
                `Verranno eliminati anche ${prev.senza_dati} esercizi senza dati.`,
              )
            : null,
          h(
            "p",
            { class: "small muted" },
            "Passati 15 giorni gli esercizi vengono eliminati definitivamente.",
          ),
        )
      : h(
          "div",
          null,
          h(
            "p",
            null,
            `Nessuno dei ${anni.length} esercizi contiene dati. Spostarli nel cestino? (ripristinabili per 15 giorni)`,
          ),
          elenco,
        );
    const ok = await GB.modal({
      title: `Elimina ${anni.length} esercizi`,
      body,
      buttons: [
        { label: "Annulla", value: false },
        {
          label: conDati ? "Sposta nel cestino" : `Elimina ${anni.length} esercizi`,
          kind: "danger",
          value: true,
        },
      ],
    });
    if (!ok) return false;
    try {
      await S.deleteAnni(anni, conDati);
    } catch (e) {
      return false; // toast già mostrato
    }
    return true;
  }
  GB.eliminaAnni = eliminaAnni;
})();
