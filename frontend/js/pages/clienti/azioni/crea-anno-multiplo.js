/* Azione «Crea esercizio» per più clienti selezionati (stesso anno e stessa data di chiusura per tutti; chi lo ha già viene saltato).
   Senza data l'esercizio chiude il 31/12 dell'anno. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const nomi = (ids) => {
    const n = ids.map((id) => {
      const c = S.clienti.find((x) => x.id === id);
      return c ? c.ragione_sociale : "#" + id;
    });
    return (
      n.slice(0, 8).join(", ") +
      (n.length > 8 ? " e altri " + (n.length - 8) : "")
    );
  };

  const dataIt = (iso) => iso.split("-").reverse().join("/");

  GB.parts.clienti.azioni.creaAnnoMultiplo = async (ids, anno, data) => {
    if (!ids.length) return;
    if (!Number.isInteger(anno) || anno < 1990 || anno > 2100) {
      GB.toast("Anno non valido (1990–2100)", "err");
      return;
    }
    data = (data || "").trim();
    if (data && data.slice(0, 4) !== String(anno)) {
      GB.toast("La data deve essere nel " + anno, "err");
      return;
    }
    const chiusura = data || anno + "-12-31";
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
        h(
          "p",
          null,
          "Data di chiusura: ",
          h("strong", null, dataIt(chiusura)),
          data ? "" : " (31/12 in automatico)",
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
      const r = await GB.api.post("/anni/bulk", {
        cliente_ids: ids,
        anno,
        data_chiusura: data || undefined,
      });
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
