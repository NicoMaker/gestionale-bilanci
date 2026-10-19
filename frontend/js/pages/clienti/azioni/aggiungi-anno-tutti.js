/* Azione «Aggiungi anno successivo a tutti i clienti»: crea l'anno successivo (se non già presente) per ogni cliente, mostra una modale di riepilogo e aggiorna l'elenco. */
(function () {
  const GB = window.GB;
  const S = GB.store;

  GB.parts.clienti.azioni.aggiungiAnnoATutti = async function () {
    if (!S.clienti.length) return GB.toast("Nessun cliente presente", "err");
    const anni = S.clienti.map((c) => ({ id: c.id, anni: c.anni || [] }));
    const toAdd = [];
    for (const c of anni) {
      const max = c.anni.length
        ? Math.max(...c.anni)
        : c.anno_base || new Date().getFullYear() - 1;
      const cand = max + 1;
      if (!c.anni.includes(cand)) toAdd.push({ id: c.id, anno: cand });
    }
    if (!toAdd.length)
      return GB.toast("Tutti i clienti hanno già l'anno successivo", "info");

    const body = document.createElement("div");
    body.appendChild(document.createElement("p")).textContent =
      `Verranno aggiunti ${toAdd.length} nuovi anni (uno per cliente). Procedere?`;

    const r = await GB.modal({
      title: "Aggiungi anno a tutti i clienti",
      body,
      buttons: [
        { label: "Annulla", value: false },
        { label: "Aggiungi", kind: "primary", value: true },
      ],
    });
    if (!r) return;

    const results = { ok: 0, exist: 0, err: [] };
    for (const t of toAdd) {
      try {
        const res = await GB.api.post(`/clienti/${t.id}/anni`, {
          anno: t.anno,
        });
        results.ok++;
      } catch (e) {
        if (e && e.status === 409) results.exist++;
        else results.err.push({ id: t.id, error: e.message || String(e) });
      }
    }

    let summary = `${results.ok} anni aggiunti.`;
    if (results.exist) summary += ` ${results.exist} già presenti.`;
    if (results.err.length)
      summary += ` ${results.err.length} errori (vedi console).`;

    GB.toast(summary);
    if (results.err.length)
      console.error("AggiungiAnnoATutti errori:", results.err);
    await S.loadClienti();
    S.emit("structure");
  };
})();
