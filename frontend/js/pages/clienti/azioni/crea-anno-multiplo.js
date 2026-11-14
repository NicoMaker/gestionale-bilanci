/* Azione «Crea esercizio» per più clienti selezionati (stesso anno, o stesso intervallo di anni, e stessa data di chiusura per tutti;
   chi ha già un anno lo mantiene com'è). Senza data l'esercizio chiude il 31/12 dell'anno. */
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

  // annoA (facoltativo): ultimo anno di un intervallo; con annoA > anno si creano tutti gli esercizi da anno a annoA
  GB.parts.clienti.azioni.creaAnnoMultiplo = async (ids, anno, data, annoA) => {
    if (!ids.length) return;
    if (!Number.isInteger(anno) || anno < 1990 || anno > 2100) {
      GB.toast("Anno non valido (1990–2100)", "err");
      return;
    }
    const intervallo = annoA !== null && annoA !== undefined && annoA !== anno;
    if (intervallo) {
      if (!Number.isInteger(annoA) || annoA < 1990 || annoA > 2100) {
        GB.toast("Anno finale non valido (1990–2100)", "err");
        return;
      }
      if (annoA < anno) {
        GB.toast("L'anno finale deve essere successivo a quello iniziale", "err");
        return;
      }
      if (annoA - anno + 1 > 60) {
        GB.toast("Al massimo 60 anni alla volta", "err");
        return;
      }
    }
    data = (data || "").trim();
    if (data && data.slice(0, 4) !== String(anno)) {
      GB.toast("La data deve essere nel " + anno, "err");
      return;
    }
    const chiusura = data || anno + "-12-31";
    const giornoMese = chiusura.slice(8) + "/" + chiusura.slice(5, 7);
    const quanti = intervallo ? annoA - anno + 1 : 1;
    const nClienti = `${ids.length} client${ids.length === 1 ? "e" : "i"}`;
    const anniElenco = Array.from({ length: quanti }, (_, i) => anno + i);
    let dateCl = {}; // date diverse {idCliente: {anno: data}} (da «Date diverse…»)
    let ok;
    for (;;) {
      const nPers = Object.values(dateCl).reduce((n, m) => n + Object.keys(m).length, 0);
      ok = await GB.modal({
        title: intervallo ? `Crea esercizi ${anno}–${annoA}` : "Crea esercizio " + anno,
        body: h(
          "div",
          null,
          h(
            "p",
            null,
            intervallo
              ? `Creare gli esercizi dal ${anno} al ${annoA} (${quanti} anni) per ${nClienti}?`
              : `Creare l'esercizio ${anno} per ${nClienti}?`,
          ),
          h(
            "p",
            null,
            intervallo ? "Chiusura comune: " : "Data di chiusura: ",
            h("strong", null, intervallo ? giornoMese : dataIt(chiusura)),
            data ? "" : " (31/12 in automatico)",
          ),
          nPers
            ? h("p", null, `Date diverse impostate: ${nPers} (cliente/anno).`)
            : null,
          h("p", { class: "small muted" }, nomi(ids)),
          h(
            "p",
            { class: "small muted" },
            intervallo
              ? "Gli anni che un cliente ha già non vengono modificati."
              : "I clienti che hanno già questo esercizio non vengono modificati.",
          ),
          h(
            "p",
            { class: "small muted" },
            "Con «Date diverse…» puoi scegliere una data di chiusura diversa per ogni cliente e per ogni anno.",
          ),
        ),
        buttons: [
          { label: "Annulla", value: false },
          { label: "Date diverse…", value: "date" },
          {
            label: intervallo ? "Crea esercizi" : "Crea esercizio",
            kind: "primary",
            value: true,
          },
        ],
      });
      if (ok !== "date") break;
      if (ids.length * anniElenco.length > 150) {
        GB.toast("Troppe combinazioni per la tabella (massimo 150 cliente/anno): riduci i clienti o gli anni", "err");
        continue;
      }
      const r = await GB.chiediDateEsercizi({
        righe: ids.map((id) => {
          const c = S.clienti.find((x) => x.id === id);
          return { id, nome: c ? c.ragione_sociale : "#" + id };
        }),
        anni: anniElenco,
        iniziali: dateCl,
      });
      if (r) dateCl = r;
    }
    if (!ok) return;
    try {
      const body = intervallo
        ? { cliente_ids: ids, da: anno, a: annoA, giorno_mese: data ? giornoMese : undefined }
        : { cliente_ids: ids, anno, data_chiusura: data || undefined };
      if (Object.keys(dateCl).length) body.date_clienti = dateCl;
      const r = await GB.api.post("/anni/bulk", body);
      GB.clientiSel.clear();
      await S.loadClienti();
      if (S.clienteId) await S.reload();
      GB.toast(
        intervallo
          ? `${r.creati} esercizi creati (${anno}–${annoA}) per ${nClienti}` +
              (r.saltati ? ` · ${r.saltati} già presenti` : "")
          : `Esercizio ${anno} creato per ${r.creati} client${r.creati === 1 ? "e" : "i"}` +
              (r.saltati ? ` · ${r.saltati} lo avevano già` : ""),
      );
    } catch (e) {
      GB.toast(e.message, "err");
    }
  };
})();
