/* Azione «Elimina selezionati»: senza dati conferma semplice; se qualche cliente contiene dati mostra l'elenco e chiede di digitare ELIMINA. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const nomeDi = (id) => {
    const c = S.clienti.find((x) => x.id === id);
    return c ? c.ragione_sociale : "#" + id;
  };
  const elenco = (nomiLista, extra) =>
    h(
      "ul",
      { class: "sel-lista" },
      ...nomiLista.slice(0, 10).map((n) => h("li", null, n)),
      nomiLista.length > 10
        ? h("li", { class: "muted" }, "… e altri " + (nomiLista.length - 10))
        : null,
    );

  GB.parts.clienti.azioni.eliminaMultiplo = async (ids) => {
    if (!ids.length) return;
    let prev;
    try {
      prev = await GB.api.post("/clienti/elimina-multiplo", {
        ids,
        anteprima: true,
      });
    } catch (e) {
      GB.toast(e.message, "err");
      return;
    }
    const n = ids.length;
    const body = { ids };

    if (!prev.con_dati.length) {
      const ok = await GB.modal({
        title: "Elimina clienti selezionati",
        body: h(
          "div",
          null,
          h(
            "p",
            null,
            `Nessuno dei ${n} clienti contiene dati. Spostarli nel cestino? (ripristinabili per 15 giorni)`,
          ),
          elenco(ids.map(nomeDi)),
        ),
        buttons: [
          { label: "Annulla", value: false },
          {
            label: `Elimina ${n} client${n === 1 ? "e" : "i"}`,
            kind: "danger",
            value: true,
          },
        ],
      });
      if (!ok) return;
    } else {
      const inp = h("input", {
        placeholder: prev.parola_conferma,
        autocomplete: "off",
      });
      const contenuto = h(
        "div",
        null,
        h(
          "p",
          null,
          `⚠️ ${prev.con_dati.length} su ${n} clienti contengono dati inseriti. Verranno spostati nel cestino e potrai ripristinarli entro 15 giorni:`,
        ),
        elenco(
          prev.con_dati.map((c) => `${c.ragione_sociale} (${c.totale} dati)`),
        ),
        prev.senza_dati
          ? h(
              "p",
              { class: "small muted" },
              `Verranno eliminati anche ${prev.senza_dati} clienti senza dati.`,
            )
          : null,
        h(
          "p",
          { class: "small muted" },
          "Passati 15 giorni i clienti e i loro dati vengono eliminati definitivamente.",
        ),
        h(
          "div",
          { class: "field", style: { marginTop: "12px" } },
          h("label", null, `Digita ${prev.parola_conferma} per confermare`),
          inp,
        ),
      );
      for (;;) {
        const r = await GB.modal({
          title: "Elimina clienti con dati",
          body: contenuto,
          buttons: [
            { label: "Annulla", value: false },
            { label: "Sposta nel cestino", kind: "danger", value: true },
          ],
        });
        if (!r) return;
        if (inp.value.trim().toUpperCase() === prev.parola_conferma) break;
        GB.toast(`Digita ${prev.parola_conferma} per confermare`, "err");
      }
      body.conferma = prev.parola_conferma;
    }

    try {
      const r = await GB.api.post("/clienti/elimina-multiplo", body);
      GB.clientiSel.clear();
      await S.loadClienti();
      if (S.clienteId && !S.clienti.some((c) => c.id === S.clienteId))
        await S.select(S.clienti[0] ? S.clienti[0].id : null);
      GB.deleted(
        `${r.eliminati} client${r.eliminati === 1 ? "e eliminato" : "i eliminati"}`,
      );
    } catch (e) {
      GB.toast(e.message, "err");
    }
  };
})();
