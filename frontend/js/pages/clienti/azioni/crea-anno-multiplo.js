/* Azione «Crea esercizio» per più clienti selezionati (stesso anno per tutti; chi lo ha già viene saltato). */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const nomi = (ids) => {
    const n = ids.map((id) => {
      const c = S.clienti.find((x) => x.id === id);
      return c ? c.ragione_sociale : "#" + id;
    });
    return n.slice(0, 8).join(", ") + (n.length > 8 ? " e altri " + (n.length - 8) : "");
  };

  GB.parts.clienti.azioni.creaAnnoMultiplo = async (ids, anno) => {
    if (!ids.length) return;
    if (!Number.isInteger(anno) || anno < 1990 || anno > 2100) {
      GB.toast("Anno non valido (1990–2100)", "err");
      return;
    }
    const ok = await GB.modal({
      title: "Crea esercizio " + anno,
      body: h(
        "div",
        null,
        h(
          "p",
          null,
          `Creare l'esercizio ${anno} per ${ids.length} client${ids.length === 1 ? "e" : "i"}?`,
        ),
        h("p", { class: "small muted" }, nomi(ids)),
        h(
          "p",
          { class: "small muted" },
          "I clienti che hanno già questo esercizio non vengono modificati.",
        ),
      ),
      buttons: [
        { label: "Annulla", value: false },
        { label: "Crea esercizio", kind: "primary", value: true },
      ],
    });
    if (!ok) return;
    try {
      const r = await GB.api.post("/anni/bulk", { cliente_ids: ids, anno });
      GB.clientiSel.clear();
      await S.loadClienti();
      if (S.clienteId) await S.reload();
      GB.toast(
        `Esercizio ${anno} creato per ${r.creati} client${r.creati === 1 ? "e" : "i"}` +
          (r.saltati ? ` · ${r.saltati} lo avevano già` : ""),
      );
    } catch (e) {
      GB.toast(e.message, "err");
    }
  };
})();
