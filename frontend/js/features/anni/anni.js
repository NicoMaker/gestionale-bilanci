/* Gestione degli anni: riepilogo dati, aggiunta e eliminazione con verifica. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  // Tabellina "cosa si perde": d = {anni:[{anno,valori,vendite,cashflow,budget_var,parametri,totale}]} oppure un singolo anno
  GB.riepilogoDati = function (d) {
    const anni = d.anni || [d];
    const th = (t) =>
      h(
        "th",
        { style: { textAlign: "right", padding: "4px 8px", fontSize: "11px" } },
        t,
      );
    return h(
      "div",
      {
        class: "tbl-wrap free",
        style: { margin: "10px 0", maxHeight: "220px" },
      },
      h(
        "table",
        { class: "fin" },
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h("th", { class: "l" }, "Anno"),
            th("Bilancio"),
            th("Vendite"),
            th("Cash flow"),
            th("Var. budget"),
            th("Parametri"),
          ),
        ),
        h(
          "tbody",
          null,
          anni
            .filter((a) => a.totale)
            .map((a) =>
              h(
                "tr",
                { class: "line" },
                h("td", { class: "l" }, String(a.anno)),
                [
                  a.valori,
                  a.vendite,
                  a.cashflow,
                  a.budget_var,
                  a.parametri,
                ].map((x) => h("td", { class: "n" }, x ? String(x) : "–")),
              ),
            ),
        ),
      ),
    );
  };

  // pulsante "aggiungi anno" dentro le pagine con tutti gli esercizi in colonna
  GB.addAnnoBtn = () =>
    h(
      "button",
      {
        class: "btn sm",
        title: "Aggiunge l'anno successivo all'ultimo esercizio",
        onclick: async () => {
          try {
            const a = await GB.store.addAnno();
            GB.toast("Anno " + a + " aggiunto");
          } catch (e) {
            /* toast già mostrato */
          }
        },
      },
      "＋ Aggiungi anno",
    );

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
          `L'anno ${anno} non contiene dati. Rimuoverlo dall'elenco?`,
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
        `⚠️ L'anno ${anno} contiene ${d.totale} dati inseriti (bilancio, vendite, budget, cash flow). Eliminandolo si perdono definitivamente:`,
      ),
      GB.riepilogoDati(d),
      h(
        "p",
        { class: "small muted" },
        "Consiglio: scarica prima il database come backup.",
      ),
    );
    const r = await GB.modal({
      title: `Elimina l'anno ${anno}`,
      body,
      buttons: [
        { label: "Annulla", value: false },
        { label: "Elimina con i dati", kind: "danger", value: true },
      ],
    });
    if (r) S.deleteAnno(anno, true).catch(() => {});
  }
  GB.eliminaAnno = eliminaAnno; // usata anche dalle intestazioni delle colonne anno (SP / CE)
})();
