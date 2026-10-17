(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  async function formCliente(c) {
    const nuovo = !c;
    const f = {
      rs: h("input", {
        value: c ? c.ragione_sociale : "",
        placeholder: "Es. Rossi S.r.l.",
      }),
      piva: h("input", {
        value: c ? c.partita_iva || "" : "",
        placeholder: "01234567890",
        inputmode: "numeric",
        pattern: "[0-9]*",
        maxlength: 11,
        autocomplete: "off",
      }),
      anno: h("input", {
        type: "number",
        value: c ? c.anno_base : new Date().getFullYear() - 1,
        min: 1990,
        max: 2100,
        disabled: !nuovo || null,
      }),
      note: h(
        "textarea",
        { rows: 3, placeholder: "Note interne…" },
        c ? c.note || "" : "",
      ),
    };
    // Partita IVA: solo cifre (vale anche per incolla e trascinamento), massimo 11
    f.piva.addEventListener("input", () => {
      const pulito = f.piva.value.replace(/\D/g, "").slice(0, 11);
      if (pulito !== f.piva.value) f.piva.value = pulito;
    });
    f.piva.addEventListener("keydown", (e) => {
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !/\d/.test(e.key)
      )
        e.preventDefault();
    });
    const body = h(
      "div",
      null,
      h("div", { class: "field" }, h("label", null, "Ragione sociale *"), f.rs),
      h(
        "div",
        { class: "row2" },
        h("div", { class: "field" }, h("label", null, "Partita IVA"), f.piva),
        h(
          "div",
          { class: "field" },
          h("label", null, "Anno impostato (ultimo esercizio chiuso)"),
          f.anno,
          nuovo
            ? h(
                "div",
                { class: "hint" },
                "Il bilancio mostra tutti gli esercizi (almeno anno−2 … anno) e il budget dell'anno successivo.",
              )
            : null,
        ),
      ),
      h("div", { class: "field" }, h("label", null, "Note"), f.note),
    );
    for (;;) {
      const r = await GB.modal({
        title: nuovo ? "Nuovo cliente" : "Modifica cliente",
        body,
        buttons: [
          { label: "Annulla", value: false },
          {
            label: nuovo ? "Crea cliente" : "Salva",
            kind: "primary",
            value: true,
          },
        ],
      });
      if (!r) return null;
      const piva = f.piva.value.replace(/\s/g, "");
      const anno = Number(f.anno.value);
      let err = null;
      if (!f.rs.value.trim()) err = "La ragione sociale è obbligatoria";
      else if (piva && !/^\d{11}$/.test(piva))
        err = "Partita IVA non valida: servono 11 cifre";
      else if (nuovo && (!Number.isInteger(anno) || anno < 1990 || anno > 2100))
        err = "Anno impostato non valido (1990–2100)";
      if (err) {
        GB.toast(err, "err");
        continue;
      }
      const payload = {
        ragione_sociale: f.rs.value,
        partita_iva: piva,
        note: f.note.value,
      };
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
        } catch (e) {
          GB.toast(e.message, "err");
        }
      };
      const demo = async () => {
        try {
          const c = await GB.api.post("/demo");
          await S.loadClienti();
          await S.select(c.id, c.anno_base);
          GB.toast("Cliente demo creato");
          location.hash = "#/dashboard";
        } catch (e) {
          GB.toast(e.message, "err");
        }
      };
      const apri = async (c) => {
        await S.select(c.id);
        location.hash = "#/dashboard";
      };
      const modifica = async (c) => {
        const p = await formCliente(c);
        if (!p) return;
        try {
          await GB.api.put("/clienti/" + c.id, p);
          await S.loadClienti();
          if (S.clienteId === c.id) await S.reload();
          GB.toast("Salvato");
        } catch (e) {
          GB.toast(e.message, "err");
        }
      };
      const norm = (x) =>
        String(x || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");
      const elimina = async (c) => {
        let d;
        try {
          d = await GB.api.get(`/clienti/${c.id}/dati`);
        } catch (e) {
          GB.toast(e.message, "err");
          return;
        }
        let url = "/clienti/" + c.id;
        if (!d.ha_dati) {
          if (
            !(await GB.confirm(
              `“${c.ragione_sociale}” non contiene dati. Eliminare il cliente?`,
            ))
          )
            return;
        } else {
          const inp = h("input", {
            placeholder: c.ragione_sociale,
            autocomplete: "off",
          });
          const body = h(
            "div",
            null,
            h(
              "p",
              null,
              `⚠️ “${c.ragione_sociale}” contiene ${d.totale} dati inseriti. Eliminandolo si perdono definitivamente:`,
            ),
            GB.riepilogoDati(d),
            h(
              "p",
              { class: "small muted" },
              "Consiglio: scarica prima il database come backup.",
            ),
            h(
              "div",
              { class: "field", style: { marginTop: "12px" } },
              h("label", null, "Digita la ragione sociale per confermare"),
              inp,
            ),
          );
          for (;;) {
            const r = await GB.modal({
              title: "Elimina cliente con dati",
              body,
              buttons: [
                { label: "Annulla", value: false },
                {
                  label: "Elimina definitivamente",
                  kind: "danger",
                  value: true,
                },
              ],
            });
            if (!r) return;
            if (norm(inp.value) === norm(c.ragione_sociale)) break;
            GB.toast("La ragione sociale digitata non coincide", "err");
          }
          url += "?conferma=" + encodeURIComponent(c.ragione_sociale);
        }
        try {
          await GB.api.del(url);
          await S.loadClienti();
          if (S.clienteId === c.id)
            await S.select(S.clienti[0] ? S.clienti[0].id : null);
          GB.toast("Cliente eliminato");
        } catch (e) {
          GB.toast(e.message, "err");
        }
      };

      const head = h(
        "div",
        {
          class: "no-print",
          style: {
            display: "flex",
            gap: "10px",
            marginBottom: "16px",
            flexWrap: "wrap",
          },
        },
        h(
          "button",
          { class: "btn primary", onclick: nuovo },
          "＋ Nuovo cliente",
        ),
        h(
          "button",
          {
            class: "btn",
            onclick: demo,
            title: "Crea un cliente di esempio con dati fittizi",
          },
          "✨ Carica cliente demo",
        ),
      );

      if (!S.clienti.length) {
        container.append(
          head,
          h(
            "div",
            { class: "empty" },
            h("div", { class: "big" }, "👥"),
            h("h2", null, "Nessun cliente"),
            h(
              "p",
              null,
              "Crea il primo cliente indicando l'anno impostato, oppure carica il cliente demo per vedere l'app all'opera.",
            ),
          ),
        );
        return { update() {} };
      }
      const table = h("table", { class: "fin" });
      table.append(
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h("th", { class: "l" }, "Ragione sociale"),
            h("th", { class: "l" }, "P.IVA"),
            h("th", null, "Anno base"),
            h("th", { class: "l" }, "Esercizi"),
            h("th", { class: "l" }, "Creato il"),
            h("th", { class: "no-print" }, ""),
          ),
        ),
      );
      const tb = h("tbody");
      table.append(tb);

      /* ── ricerca cliente: ragione sociale, P.IVA, anni, note — senza distinguere maiuscole/accenti ── */
      const plain = (s) =>
        String(s ?? "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "");
      const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchIn = (c) =>
        plain(
          [
            c.ragione_sociale,
            c.partita_iva,
            c.anno_base,
            (c.anni || []).join(" "),
            c.note,
          ].join(" "),
        );
      const hay = new Map(S.clienti.map((c) => [c.id, searchIn(c)]));
      // evidenzia nel testo i termini cercati (le lettere accentate mantengono la stessa lunghezza dopo la normalizzazione)
      const hl = (text, toks) => {
        const t = String(text);
        if (!toks.length) return t;
        const re = new RegExp("(" + toks.map(esc).join("|") + ")", "gi");
        const p = plain(t);
        if (p.length !== t.length) return t;
        const out = [];
        let last = 0,
          m;
        const reP = new RegExp(re.source, "gi");
        while ((m = reP.exec(p)) && m[0]) {
          out.push(
            t.slice(last, m.index),
            h("mark", { class: "hl" }, t.slice(m.index, m.index + m[0].length)),
          );
          last = m.index + m[0].length;
        }
        out.push(t.slice(last));
        return out;
      };

      const input = h("input", {
        type: "search",
        placeholder: "Cerca cliente per nome, P.IVA o anno…",
        autocomplete: "off",
        spellcheck: "false",
        "aria-label": "Cerca cliente",
        value: GB.clientiQuery || "",
      });
      const clear = h(
        "button",
        {
          type: "button",
          class: "ls-clear",
          title: "Cancella ricerca",
          "aria-label": "Cancella ricerca",
        },
        "✕",
      );
      const wrap = h(
        "div",
        { class: "list-search" },
        h("span", { class: "ls-ico", "aria-hidden": "true" }, "🔍"),
        input,
        clear,
      );
      const count = h("div", { class: "list-count", "aria-live": "polite" });
      const tools = h("div", { class: "list-tools no-print" }, wrap, count);

      function paintRows() {
        const q = input.value;
        GB.clientiQuery = q;
        const toks = plain(q).split(/\s+/).filter(Boolean);
        wrap.classList.toggle("has-value", !!q);
        const rows = S.clienti.filter((c) =>
          toks.every((k) => hay.get(c.id).includes(k)),
        );
        tb.replaceChildren(
          ...(rows.length
            ? rows.map((c) =>
                h(
                  "tr",
                  {
                    class: "line",
                    style: { fontWeight: c.id === S.clienteId ? 700 : 400 },
                  },
                  h(
                    "td",
                    { class: "l client-name" },
                    hl(c.ragione_sociale, toks),
                    c.id === S.clienteId ? "  ◀ selezionato" : "",
                  ),
                  h(
                    "td",
                    { class: "l" },
                    c.partita_iva ? hl(c.partita_iva, toks) : "—",
                  ),
                  h("td", { class: "n" }, String(c.anno_base)),
                  h("td", { class: "l" }, (c.anni || []).join(", ")),
                  h("td", { class: "l" }, fmt.data(c.created_at)),
                  h(
                    "td",
                    {
                      class: "no-print",
                      style: { textAlign: "right", whiteSpace: "nowrap" },
                    },
                    h(
                      "button",
                      { class: "btn sm primary", onclick: () => apri(c) },
                      "Apri",
                    ),
                    " ",
                    h(
                      "button",
                      { class: "btn sm", onclick: () => modifica(c) },
                      "Modifica",
                    ),
                    " ",
                    h(
                      "button",
                      { class: "btn sm danger", onclick: () => elimina(c) },
                      "Elimina",
                    ),
                  ),
                ),
              )
            : [
                h(
                  "tr",
                  { class: "no-results" },
                  h(
                    "td",
                    { colspan: 6 },
                    `Nessun cliente trovato per “${q.trim()}”`,
                  ),
                ),
              ]),
        );
        count.textContent = toks.length
          ? `${rows.length} di ${S.clienti.length} clienti`
          : `${S.clienti.length} client${S.clienti.length === 1 ? "e" : "i"}`;
        return rows;
      }
      input.addEventListener("input", paintRows);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && input.value) {
          e.preventDefault();
          input.value = "";
          paintRows();
        } else if (e.key === "Enter") {
          const rows = paintRows();
          if (rows.length === 1) apri(rows[0]);
        } // un solo risultato: Invio apre il cliente
      });
      clear.addEventListener("click", () => {
        input.value = "";
        paintRows();
        input.focus();
      });
      paintRows();

      container.append(
        GB.printHead("Elenco clienti", ""),
        head,
        tools,
        h("div", { class: "tbl-wrap free" }, table),
      );
      if (GB.clientiQuery) {
        const l = input.value.length;
        input.focus({ preventScroll: true });
        try {
          input.setSelectionRange(l, l);
        } catch (e) {
          /* type=search */
        }
      }
      return { update() {} };
    },
  };
})();
