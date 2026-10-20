/* Cestino: tutto ciò che è stato eliminato o azzerato (clienti, esercizi, righe, valori, vendite, parametri) resta 15 giorni
   e si può ripristinare, singolarmente o a gruppi, oppure eliminare definitivamente. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const TIPI = {
    cliente: ["👥", "Cliente"],
    anno: ["🗓️", "Esercizio"],
    voci: ["📄", "Righe"],
    azzera_valori: ["🧹", "Valori azzerati"],
    azzera_vendite: ["🛒", "Vendite azzerate"],
    azzera_parametri: ["⚙️", "Parametri azzerati"],
  };
  const data = (iso) =>
    new Date(iso).toLocaleString("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    });
  const plurale = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;

  // filtri e selezione si conservano mentre si usa la pagina
  const stato = { tipo: "", q: "", sel: new Set() };

  GB.pages.cestino = {
    title: "Cestino",
    icon: "🗑️",
    noClient: true,
    render(container) {
      const box = h("div", { id: "cestino-box" });
      container.append(
        GB.printHead("Cestino", ""),
        h(
          "div",
          { class: "note no-print" },
          "Clienti, esercizi, righe e valori eliminati o azzerati restano qui per ",
          h("b", null, GB.cestino.giorni + " giorni"),
          ": puoi ripristinarli con tutti i loro dati. Passato questo tempo vengono cancellati definitivamente.",
        ),
        box,
      );
      carica(box);
      return { update() {} };
    },
  };

  async function carica(box) {
    let r;
    try {
      r = await GB.api.get("/cestino");
    } catch (e) {
      box.replaceChildren(
        h(
          "div",
          { class: "note", style: { borderLeftColor: "var(--red)" } },
          e.message,
        ),
      );
      return;
    }
    GB.cestino.giorni = r.giorni;
    GB.cestino.n = r.elementi.length;
    if (GB.app.buildNav) GB.app.buildNav();
    // la selezione tiene solo ciò che esiste ancora
    const esistono = new Set(r.elementi.map((x) => x.id));
    stato.sel = new Set([...stato.sel].filter((id) => esistono.has(id)));
    disegna(box, r.elementi);
  }

  async function ripristina(box, ids) {
    let r;
    try {
      r = await GB.api.post("/cestino/ripristina", { ids });
    } catch (e) {
      GB.toast(e.message, "err");
      return;
    }
    if (r.ripristinati.length)
      GB.toast(
        plurale(
          r.ripristinati.length,
          "elemento ripristinato",
          "elementi ripristinati",
        ),
      );
    if (r.errori.length)
      await GB.modal({
        title: "Alcuni elementi non sono stati ripristinati",
        body: h(
          "ul",
          { class: "sel-lista" },
          r.errori.map((e) =>
            h("li", null, h("b", null, e.etichetta), " — ", e.error),
          ),
        ),
      });
    stato.sel.clear();
    await GB.cestino.dopoRipristino(); // ricarica clienti e dati; ridisegna la pagina
  }

  async function eliminaDef(box, ids, nome) {
    const ok = await GB.confirm(
      `Eliminare definitivamente ${nome}? Non potrai più ripristinare${ids.length === 1 ? "lo" : "li"}.`,
      "Elimina definitivamente",
    );
    if (!ok) return;
    try {
      await GB.api.post("/cestino/elimina", { ids });
      stato.sel.clear();
      GB.toast("Eliminato definitivamente");
      carica(box);
    } catch (e) {
      GB.toast(e.message, "err");
    }
  }

  async function svuota(box, n) {
    if (
      !(await GB.confirm(
        `Svuotare il cestino? ${plurale(n, "elemento verrà eliminato", "elementi verranno eliminati")} definitivamente.`,
        "Svuota cestino",
      ))
    )
      return;
    try {
      await GB.api.del("/cestino");
      stato.sel.clear();
      GB.toast("Cestino svuotato");
      carica(box);
    } catch (e) {
      GB.toast(e.message, "err");
    }
  }

  function disegna(box, tutti) {
    if (!tutti.length) {
      box.replaceChildren(
        h(
          "div",
          { class: "empty" },
          h("div", { class: "big" }, "🗑️"),
          h("h2", null, "Il cestino è vuoto"),
          h(
            "p",
            null,
            "Quando elimini o azzeri qualcosa lo ritrovi qui per 15 giorni.",
          ),
        ),
      );
      return;
    }
    const q = stato.q.trim().toLowerCase();
    const visibili = tutti.filter(
      (x) =>
        (!stato.tipo || x.tipo === stato.tipo) &&
        (!q ||
          [x.etichetta, x.dettaglio, x.cliente_nome]
            .join(" ")
            .toLowerCase()
            .includes(q)),
    );
    const ridisegna = () => disegna(box, tutti);

    /* filtri */
    const selTipo = h(
      "select",
      {
        class: "cest-filtro",
        onchange: (e) => {
          stato.tipo = e.target.value;
          ridisegna();
        },
      },
      h("option", { value: "" }, "Tutti i tipi"),
      Object.entries(TIPI).map(([k, v]) =>
        h("option", { value: k }, `${v[0]} ${v[1]}`),
      ),
    );
    selTipo.value = stato.tipo;
    const cerca = h("input", {
      type: "search",
      class: "cest-cerca",
      placeholder: "Cerca nel cestino…",
      value: stato.q,
      oninput: (e) => {
        stato.q = e.target.value;
        const pos = e.target.selectionStart;
        ridisegna();
        const i = box.querySelector(".cest-cerca");
        i.focus();
        i.setSelectionRange(pos, pos);
      },
    });

    /* barra azioni */
    const nSel = stato.sel.size;
    const ids = [...stato.sel];
    const barra = h(
      "div",
      { class: "cest-barra no-print" },
      selTipo,
      cerca,
      h("span", { class: "grow" }),
      nSel
        ? [
            h(
              "span",
              { class: "sel-count" },
              plurale(nSel, "selezionato", "selezionati"),
            ),
            h(
              "button",
              { class: "btn primary sm", onclick: () => ripristina(box, ids) },
              "↩ Ripristina",
            ),
            h(
              "button",
              {
                class: "btn danger sm",
                onclick: () =>
                  eliminaDef(box, ids, plurale(nSel, "elemento", "elementi")),
              },
              "Elimina definitivamente",
            ),
          ]
        : null,
      h(
        "button",
        { class: "btn sm", onclick: () => svuota(box, tutti.length) },
        "Svuota cestino",
      ),
    );

    /* tabella */
    const chkAll = h("input", {
      type: "checkbox",
      class: "sel-chk",
      "aria-label": "Seleziona tutti",
      checked:
        visibili.length && visibili.every((x) => stato.sel.has(x.id))
          ? true
          : null,
      onchange: (e) => {
        visibili.forEach((x) =>
          e.target.checked ? stato.sel.add(x.id) : stato.sel.delete(x.id),
        );
        ridisegna();
      },
    });
    const tb = h("tbody");
    visibili.forEach((x) => {
      const [icona, nomeTipo] = TIPI[x.tipo] || ["•", x.tipo];
      const urgente =
        x.giorni_rimasti <= 3 ? "ko" : x.giorni_rimasti <= 7 ? "warn" : "info";
      tb.append(
        h(
          "tr",
          { class: "line" + (stato.sel.has(x.id) ? " selected" : "") },
          h(
            "td",
            { class: "sel-col no-print" },
            h("input", {
              type: "checkbox",
              class: "sel-chk",
              "aria-label": "Seleziona",
              checked: stato.sel.has(x.id) ? true : null,
              onchange: (e) => {
                e.target.checked ? stato.sel.add(x.id) : stato.sel.delete(x.id);
                ridisegna();
              },
            }),
          ),
          h(
            "td",
            { class: "l" },
            h("span", { class: "cest-tipo" }, icona + " " + nomeTipo),
          ),
          h(
            "td",
            { class: "l" },
            h("div", { class: "cest-nome" }, x.etichetta),
            x.dettaglio
              ? h("div", { class: "muted small" }, x.dettaglio)
              : null,
          ),
          h("td", { class: "l" }, x.cliente_nome || "—"),
          h("td", { class: "l" }, data(x.data_eliminazione)),
          h(
            "td",
            { class: "l" },
            h(
              "span",
              {
                class: "pill " + urgente,
                title: "Eliminazione definitiva il " + data(x.scade_il),
              },
              plurale(x.giorni_rimasti, "giorno", "giorni"),
            ),
          ),
          h(
            "td",
            { class: "pen-cell no-print" },
            h(
              "button",
              {
                class: "btn sm",
                title: "Ripristina",
                onclick: () => ripristina(box, [x.id]),
              },
              "↩ Ripristina",
            ),
            h(
              "button",
              {
                class: "xbtn",
                title: "Elimina definitivamente",
                onclick: () => eliminaDef(box, [x.id], "questo elemento"),
              },
              "✕",
            ),
          ),
        ),
      );
    });
    if (!visibili.length)
      tb.append(
        h(
          "tr",
          null,
          h(
            "td",
            {
              colspan: 7,
              class: "muted",
              style: { padding: "18px", textAlign: "center" },
            },
            "Nessun elemento corrisponde alla ricerca",
          ),
        ),
      );

    const table = h(
      "table",
      { class: "fin cest-tab" },
      h(
        "thead",
        null,
        h(
          "tr",
          null,
          h("th", { class: "sel-col no-print" }, chkAll),
          h("th", { class: "l" }, "Tipo"),
          h("th", { class: "l" }, "Elemento"),
          h("th", { class: "l" }, "Cliente"),
          h("th", { class: "l" }, "Eliminato il"),
          h("th", { class: "l" }, "Scade tra"),
          h("th", { class: "no-print" }, ""),
        ),
      ),
      tb,
    );
    box.replaceChildren(barra, h("div", { class: "tbl-wrap free" }, table));
  }
})();
