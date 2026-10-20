/* Selezione multipla delle righe: casella accanto a ogni riga, barra delle azioni in basso (elimina / azzera / seleziona tutte)
   e strumenti di sezione (seleziona, azzera, elimina tutta la sezione).

   GB.sel.voci({ key, ambito|ambiti, cosa, anno, extra })  → contesto per righe di conto (S.P., C.E., Cash Flow, Budget)
   GB.sel.mesi({ years })                                   → contesto per i mesi della pagina Vendite
   GB.sel.box(ctx, id)                                      → casella di selezione di una riga
   GB.sel.sezione(ctx, { label, ids })                      → pulsanti «seleziona / azzera / elimina» per l'intestazione di una sezione */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const state = { key: null, ctx: null, ids: new Set() };
  let bar = null;

  const plural = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;

  /* ── barra in basso ── */
  function ensureBar() {
    if (bar) return bar;
    bar = h("div", { class: "selbar no-print", role: "toolbar" });
    document.body.append(bar);
    return bar;
  }

  function paint() {
    document.querySelectorAll(".sel-box").forEach((b) => {
      const on = state.ctx && state.ids.has(Number(b.dataset.id));
      b.checked = !!on;
      const tr = b.closest("tr");
      if (tr) tr.classList.toggle("sel", !!on);
    });
    const b = ensureBar();
    const n = state.ids.size;
    b.classList.toggle("on", n > 0);
    if (!n) return b.replaceChildren();
    const c = state.ctx;
    b.replaceChildren(
      h("span", { class: "selbar-n" }, plural(n, c.uno, c.molti) + " selezionat" + (n === 1 ? (c.f ? "a" : "o") : c.f ? "e" : "i")),
      h(
        "button",
        { class: "btn sm", onclick: () => GB.sel.set(c, c.all()) },
        "Seleziona tutt" + (c.f ? "e" : "i"),
      ),
      c.azzera
        ? h(
            "button",
            { class: "btn sm", onclick: () => GB.sel.azzeraSel() },
            c.azzeraLabel || "Azzera valori",
          )
        : null,
      c.elimina
        ? h(
            "button",
            { class: "btn sm danger", onclick: () => GB.sel.eliminaSel() },
            "Elimina " + (c.f ? "selezionate" : "selezionati"),
          )
        : null,
      h(
        "button",
        { class: "btn sm", onclick: () => GB.sel.clear() },
        "Annulla",
      ),
    );
  }

  GB.sel = {
    clear() {
      state.ids.clear();
      state.ctx = null;
      state.key = null;
      paint();
    },
    // sostituisce la selezione con questi id
    set(ctx, ids) {
      if (state.key !== ctx.key) state.ids.clear();
      state.key = ctx.key;
      state.ctx = ctx;
      state.ids = new Set(ids);
      paint();
    },
    toggle(ctx, id, on) {
      if (state.key !== ctx.key) state.ids.clear();
      state.key = ctx.key;
      state.ctx = ctx;
      if (on) state.ids.add(id);
      else state.ids.delete(id);
      if (!state.ids.size) return GB.sel.clear();
      paint();
    },
    box(ctx, id) {
      return h("input", {
        type: "checkbox",
        class: "sel-box no-ro no-print",
        "data-id": id,
        title: "Seleziona",
        "aria-label": "Seleziona",
        checked: state.key === ctx.key && state.ids.has(id) ? true : null,
        onchange: (e) => GB.sel.toggle(ctx, id, e.target.checked),
      });
    },
    async eliminaSel() {
      const c = state.ctx;
      if (!c) return;
      const ids = [...state.ids];
      if (await c.elimina(ids)) GB.sel.clear();
    },
    async azzeraSel() {
      const c = state.ctx;
      if (!c) return;
      const ids = [...state.ids];
      if (await c.azzera(ids)) GB.sel.clear();
    },

    /* ── contesto per righe di conto ── */
    voci({ key, ambiti, cosa, anno, extra = "" }) {
      const righe = () => S.ds.voci.filter((v) => ambiti.includes(v.ambito));
      const conta = (ids) => {
        let n = 0;
        const nz = (o) =>
          Object.values(o || {}).filter((x) => x !== null && x !== undefined)
            .length;
        ids.forEach((id) => {
          if (cosa === "valori") n += nz(S.ds.val[id]);
          else if (cosa === "budget") n += S.ds.bvar[id] && S.ds.bvar[id][anno] != null ? 1 : 0;
          else n += ((S.ds.cf[id] || {})[anno] || []).filter((x) => x).length;
        });
        return n;
      };
      const tuttiDati = (ids) => {
        let n = 0;
        const nz = (o) =>
          Object.values(o || {}).filter((x) => x !== null && x !== undefined)
            .length;
        ids.forEach((id) => {
          n += nz(S.ds.val[id]) + nz(S.ds.bvar[id]);
          Object.values(S.ds.cf[id] || {}).forEach(
            (arr) => (n += arr.filter((x) => x).length),
          );
        });
        return n;
      };
      return {
        key,
        uno: "riga",
        molti: "righe",
        f: true,
        all: () => righe().map((v) => v.id),
        azzeraLabel:
          cosa === "budget" ? "Azzera variazioni" : "Azzera valori",
        async elimina(ids) {
          const n = tuttiDati(ids);
          const msg =
            ids.length === 1
              ? `Eliminare la riga selezionata${n ? ` e i suoi ${n} valori` : ""}? Finisce nel cestino e la puoi ripristinare entro 15 giorni.`
              : `Eliminare ${ids.length} righe${n ? ` e i ${n} valori che contengono` : ""}? Finiscono nel cestino e le puoi ripristinare entro 15 giorni.`;
          if (!(await GB.confirm(msg + extra))) return false;
          try {
            await S.deleteVoci(ids);
          } catch (e) {
            return false;
          }
          return true;
        },
        async azzera(ids) {
          const n = conta(ids);
          if (!n) {
            GB.toast("Nessun valore da azzerare");
            return true;
          }
          if (
            !(await GB.confirm(
              `Cancellare ${plural(n, "valore", "valori")} in ${plural(ids.length, "riga", "righe")}? Le righe restano al loro posto e i valori si possono ripristinare dal cestino entro 15 giorni.`,
              "Azzera",
            ))
          )
            return false;
          try {
            await S.clearVoci(ids, cosa, anno);
          } catch (e) {
            return false;
          }
          return true;
        },
      };
    },

    /* ── contesto per i mesi delle Vendite ── */
    mesi({ key, years }) {
      const T = window.Template;
      return {
        key,
        uno: "mese",
        molti: "mesi",
        f: false,
        all: () => T.MESI.map((_, m) => m + 1),
        azzeraLabel: "Azzera vendite",
        async azzera(mesi) {
          const nomi = mesi.map((m) => T.MESI[m - 1].toLowerCase()).join(", ");
          if (
            !(await GB.confirm(
              `Azzerare le vendite di ${nomi} per tutti gli esercizi (${years.join(", ")})?`,
              "Azzera",
            ))
          )
            return false;
          try {
            await S.clearVendite({ mesi });
          } catch (e) {
            return false;
          }
          return true;
        },
      };
    },

    /* ── pulsanti nell'intestazione di una sezione ── */
    sezione(ctx, { label, ids, nota = "" }) {
      const vuota = !ids.length;
      const btn = (testo, titolo, fn, cls = "") =>
        h(
          "button",
          {
            type: "button",
            class: "sec-btn " + cls,
            title: titolo,
            disabled: vuota || null,
            onclick: (e) => {
              e.stopPropagation();
              fn();
            },
          },
          testo,
        );
      return h(
        "span",
        { class: "sec-tools no-ro no-print" },
        btn("☑ Seleziona", `Seleziona le righe di «${label}»`, () =>
          GB.sel.set(ctx, ids),
        ),
        ctx.azzera
          ? btn("Azzera", `Cancella i valori di «${label}» (le righe restano)`, () =>
              ctx.azzera(ids),
            )
          : null,
        ctx.elimina
          ? btn(
              "Elimina righe",
              `Elimina tutte le righe di «${label}»`,
              () => ctx.elimina(ids),
              "danger",
            )
          : null,
      );
    },
  };

  // cambiando pagina o ridisegnandola la selezione si azzera (gli id potrebbero non esistere più)
  S.on("structure", () => GB.sel.clear());
  S.on("context", () => GB.sel.clear());
  window.addEventListener("hashchange", () => GB.sel.clear());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.ids.size && !document.querySelector(".overlay"))
      GB.sel.clear();
  });
})();
