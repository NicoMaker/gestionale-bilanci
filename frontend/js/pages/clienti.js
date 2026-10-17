(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  async function formCliente(c) {
    const nuovo = !c;
    const f = {
      rs: h("input", { value: c ? c.ragione_sociale : "", placeholder: "Es. Rossi S.r.l." }),
      piva: h("input", { value: c ? c.partita_iva || "" : "", placeholder: "01234567890" }),
      anno: h("input", { type: "number", value: c ? c.anno_base : new Date().getFullYear() - 1, min: 1990, max: 2100, disabled: !nuovo || null }),
      note: h("textarea", { rows: 3, placeholder: "Note interne…" }, c ? c.note || "" : ""),
    };
    const body = h("div", null,
      h("div", { class: "field" }, h("label", null, "Ragione sociale *"), f.rs),
      h("div", { class: "row2" },
        h("div", { class: "field" }, h("label", null, "Partita IVA"), f.piva),
        h("div", { class: "field" }, h("label", null, "Anno impostato (ultimo esercizio chiuso)"), f.anno, nuovo ? h("div", { class: "hint" }, "Il bilancio mostra 3 esercizi (anno−2 … anno) e il budget dell'anno successivo.") : null)),
      h("div", { class: "field" }, h("label", null, "Note"), f.note));
    for (;;) {
      const r = await GB.modal({ title: nuovo ? "Nuovo cliente" : "Modifica cliente", body, buttons: [{ label: "Annulla", value: false }, { label: nuovo ? "Crea cliente" : "Salva", kind: "primary", value: true }] });
      if (!r) return null;
      const piva = f.piva.value.replace(/\s/g, "");
      const anno = Number(f.anno.value);
      let err = null;
      if (!f.rs.value.trim()) err = "La ragione sociale è obbligatoria";
      else if (piva && !/^\d{11}$/.test(piva)) err = "Partita IVA non valida: servono 11 cifre";
      else if (nuovo && (!Number.isInteger(anno) || anno < 1990 || anno > 2100)) err = "Anno impostato non valido (1990–2100)";
      if (err) { GB.toast(err, "err"); continue; }
      const payload = { ragione_sociale: f.rs.value, partita_iva: piva, note: f.note.value };
      if (nuovo) payload.anno_base = anno;
      return payload;
    }
  }

  GB.pages.clienti = {
    title: "Clienti",
    icon: "👥",
    noClient: true,
    render(container) {
      const S = GB.store;
      const nuovo = async () => {
        const p = await formCliente(null);
        if (!p) return;
        try {
          const c = await GB.api.post("/clienti", p);
          await S.loadClienti();
          await S.select(c.id, c.anno_base);
          GB.toast("Cliente creato");
          location.hash = "#/dashboard";
        } catch (e) { GB.toast(e.message, "err"); }
      };
      const demo = async () => {
        try {
          const c = await GB.api.post("/demo");
          await S.loadClienti();
          await S.select(c.id, c.anno_base);
          GB.toast("Cliente demo creato");
          location.hash = "#/dashboard";
        } catch (e) { GB.toast(e.message, "err"); }
      };
      const apri = async (c) => { await S.select(c.id); location.hash = "#/dashboard"; };
      const modifica = async (c) => {
        const p = await formCliente(c);
        if (!p) return;
        try { await GB.api.put("/clienti/" + c.id, p); await S.loadClienti(); if (S.clienteId === c.id) await S.reload(); GB.toast("Salvato"); } catch (e) { GB.toast(e.message, "err"); }
      };
      const norm = (x) => String(x || "").trim().toLowerCase().replace(/\s+/g, " ");
      const elimina = async (c) => {
        let d;
        try { d = await GB.api.get(`/clienti/${c.id}/dati`); } catch (e) { GB.toast(e.message, "err"); return; }
        let url = "/clienti/" + c.id;
        if (!d.ha_dati) {
          if (!(await GB.confirm(`“${c.ragione_sociale}” non contiene dati. Eliminare il cliente?`))) return;
        } else {
          const inp = h("input", { placeholder: c.ragione_sociale, autocomplete: "off" });
          const body = h("div", null,
            h("p", null, `⚠️ “${c.ragione_sociale}” contiene ${d.totale} dati inseriti. Eliminandolo si perdono definitivamente:`),
            GB.riepilogoDati(d),
            h("p", { class: "small muted" }, "Consiglio: scarica prima il database come backup."),
            h("div", { class: "field", style: { marginTop: "12px" } }, h("label", null, "Digita la ragione sociale per confermare"), inp));
          for (;;) {
            const r = await GB.modal({ title: "Elimina cliente con dati", body, buttons: [{ label: "Annulla", value: false }, { label: "Elimina definitivamente", kind: "danger", value: true }] });
            if (!r) return;
            if (norm(inp.value) === norm(c.ragione_sociale)) break;
            GB.toast("La ragione sociale digitata non coincide", "err");
          }
          url += "?conferma=" + encodeURIComponent(c.ragione_sociale);
        }
        try {
          await GB.api.del(url);
          await S.loadClienti();
          if (S.clienteId === c.id) await S.select(S.clienti[0] ? S.clienti[0].id : null);
          GB.toast("Cliente eliminato");
        } catch (e) { GB.toast(e.message, "err"); }
      };

      const head = h("div", { class: "no-print", style: { display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" } },
        h("button", { class: "btn primary", onclick: nuovo }, "＋ Nuovo cliente"),
        h("button", { class: "btn", onclick: demo, title: "Crea un cliente di esempio con dati fittizi" }, "✨ Carica cliente demo"));

      if (!S.clienti.length) {
        container.append(head, h("div", { class: "empty" }, h("div", { class: "big" }, "👥"), h("h2", null, "Nessun cliente"), h("p", null, "Crea il primo cliente indicando l'anno impostato, oppure carica il cliente demo per vedere l'app all'opera.")));
        return { update() {} };
      }
      const table = h("table", { class: "fin" });
      table.append(h("thead", null, h("tr", null, h("th", { class: "l" }, "Ragione sociale"), h("th", { class: "l" }, "P.IVA"), h("th", null, "Anno base"), h("th", { class: "l" }, "Esercizi"), h("th", { class: "l" }, "Creato il"), h("th", { class: "no-print" }, ""))));
      const tb = h("tbody"); table.append(tb);
      S.clienti.forEach((c) => {
        tb.append(h("tr", { class: "line", style: { fontWeight: c.id === S.clienteId ? 700 : 400 } },
          h("td", { class: "l client-name" }, c.ragione_sociale + (c.id === S.clienteId ? "  ◀ selezionato" : "")),
          h("td", { class: "l" }, c.partita_iva || "—"), h("td", { class: "n" }, String(c.anno_base)),
          h("td", { class: "l" }, (c.anni || []).join(", ")), h("td", { class: "l" }, fmt.data(c.created_at)),
          h("td", { class: "no-print", style: { textAlign: "right", whiteSpace: "nowrap" } },
            h("button", { class: "btn sm primary", onclick: () => apri(c) }, "Apri"), " ",
            h("button", { class: "btn sm", onclick: () => modifica(c) }, "Modifica"), " ",
            h("button", { class: "btn sm danger", onclick: () => elimina(c) }, "Elimina"))));
      });
      container.append(GB.printHead("Elenco clienti", ""), head, h("div", { class: "tbl-wrap free" }, table));
      return { update() {} };
    },
  };
})();
