/* Panoramica: «Crea anni per tutti i clienti». Crea gli esercizi da un anno a un altro (estremi inclusi) per TUTTI i clienti in un colpo.
   Chi ha già un anno lo tiene com'è (non viene toccato né ricreato). Data di chiusura: giorno e mese comuni (vuota = 31/12)
   oppure date diverse per ogni cliente e anno («Date diverse…»). Usata dalla Panoramica e dalla pagina Clienti. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  const MAX_ANNI = 60;
  const annoOk = (a) => Number.isInteger(a) && a >= 1990 && a <= 2100;

  /* st = { clienti: [{id, ragione_sociale}], anni_disponibili: [..] } (va bene anche la risposta di /statistiche); dopo la creazione chiama dopo(). */
  GB.parts.studio.creaAnniTutti = async (st, dopo) => {
    const S = GB.store;
    const ids = st.clienti.map((c) => c.id);
    if (!ids.length) {
      GB.toast("Non ci sono clienti", "err");
      return;
    }
    const nClienti = `${ids.length} client${ids.length === 1 ? "e" : "i"}`;
    const ultimo = Math.max(0, ...(st.anni_disponibili || []));
    const prossimo = (ultimo || new Date().getFullYear() - 1) + 1;
    const da = h("input", { type: "number", min: 1990, max: 2100, value: prossimo });
    const a = h("input", { type: "number", min: 1990, max: 2100, value: prossimo });
    const anteprima = h("div", { class: "dc-preview" });
    let campo;
    let dateCl = {}; // date diverse {idCliente: {anno: "AAAA-MM-GG"}} (da «Date diverse…»)
    const valori = () => {
      const x = Number(da.value);
      const y = a.value === "" ? x : Number(a.value);
      return { x, y };
    };
    const errore = () => {
      const { x, y } = valori();
      if (!annoOk(x) || !annoOk(y)) return "Indica anni tra 1990 e 2100.";
      if (y < x)
        return "L'anno finale deve essere uguale o successivo a quello iniziale.";
      if (y - x + 1 > MAX_ANNI) return `Al massimo ${MAX_ANNI} anni alla volta.`;
      return null;
    };
    const reset = GB.resetDataBtn({
      title: "Reimposta: la data di chiusura torna al 31/12 (automatica)",
      onclick: () => {
        campo.reset();
        campo.input.focus();
      },
    });
    const nPers = () =>
      Object.values(dateCl).reduce((n, m) => n + Object.keys(m).length, 0);
    const aggiorna = () => {
      if (campo) reset.disabled = campo.vuoto();
      const { x, y } = valori();
      anteprima.textContent =
        errore() ||
        (y === x
          ? `Verrà creato l'esercizio ${x} per ${nClienti}.`
          : `Verranno creati gli esercizi dal ${x} al ${y} (${y - x + 1} anni) per ${nClienti}.`) +
          " A chi ha già un anno non cambia nulla." +
          (nPers() ? ` Date diverse impostate: ${nPers()} (cliente/anno).` : "");
    };
    campo = GB.campoData({
      anno: annoOk(Number(da.value)) ? Number(da.value) : prossimo,
      compatto: true,
      etichetta: "Data di chiusura comune (gg/mm)",
      onChange: aggiorna,
    });
    da.addEventListener("input", () => {
      const x = Number(da.value);
      if (annoOk(x)) campo.setAnno(x);
      aggiorna();
    });
    a.addEventListener("input", aggiorna);
    aggiorna();

    const body = h(
      "div",
      null,
      h(
        "p",
        { class: "edit-intro" },
        "Crea gli esercizi dall'anno iniziale a quello finale (compresi) per tutti i clienti. Se un cliente ha già un anno, lo tiene com'è e non viene ricreato.",
      ),
      h(
        "div",
        { class: "row2" },
        h("div", { class: "field" }, h("label", null, "Dall'anno"), da),
        h("div", { class: "field" }, h("label", null, "All'anno"), a),
      ),
      h(
        "div",
        { class: "field" },
        h("label", null, "Data di chiusura comune a tutti gli anni"),
        h("span", { class: "dcamp-riga" }, campo.el, reset),
        h(
          "div",
          { class: "hint" },
          "Scrivi solo giorno e mese (es. 30/06): l'anno si aggiunge da solo. Se la lasci vuota ogni esercizio chiude il 31/12.",
        ),
      ),
      anteprima,
    );

    for (;;) {
      const ok = await GB.modal({
        title: "Crea anni per tutti i clienti",
        body,
        buttons: [
          { label: "Annulla", value: false },
          { label: "Date diverse…", value: "date" },
          { label: "Crea esercizi", kind: "primary", value: true },
        ],
      });
      if (!ok) return;
      const err = errore();
      if (err) {
        GB.toast(err.replace(/\.$/, ""), "err");
        continue;
      }
      if (ok === "date") {
        const { x, y } = valori();
        const anniElenco = Array.from({ length: y - x + 1 }, (_, i) => x + i);
        if (ids.length * anniElenco.length > 150) {
          GB.toast(
            "Troppe combinazioni per la tabella (massimo 150 cliente/anno): riduci gli anni",
            "err",
          );
          continue;
        }
        const r = await GB.chiediDateEsercizi({
          righe: st.clienti.map((c) => ({ id: c.id, nome: c.ragione_sociale })),
          anni: anniElenco,
          iniziali: dateCl,
        });
        if (r) dateCl = r;
        aggiorna();
        continue;
      }
      const iso = campo.get(true); // data non valida: avviso e la finestra si riapre
      if (iso === null) continue;
      const { x, y } = valori();
      try {
        const body = {
          cliente_ids: ids,
          da: x,
          a: y,
          giorno_mese: iso ? iso.slice(8) + "/" + iso.slice(5, 7) : undefined,
        };
        // si inviano solo le date degli anni ancora in intervallo (l'intervallo può essere stato cambiato dopo)
        const date = {};
        for (const [id, m] of Object.entries(dateCl))
          for (const [anno, d] of Object.entries(m))
            if (+anno >= x && +anno <= y) (date[id] = date[id] || {})[anno] = d;
        if (Object.keys(date).length) body.date_clienti = date;
        const r = await GB.api.post("/anni/bulk", body);
        await S.loadClienti();
        if (S.clienteId) await S.reload();
        GB.toast(
          r.creati
            ? `${r.creati} esercizi creati per ${nClienti}` +
                (r.saltati ? ` · ${r.saltati} già presenti, lasciati com'erano` : "")
            : "Nessun esercizio creato: tutti i clienti li avevano già",
        );
        if (dopo) dopo();
      } catch (e) {
        GB.toast(e.message, "err");
      }
      return;
    }
  };
})();
