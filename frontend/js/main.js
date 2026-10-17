/* Avvio, routing (hash), sidebar, topbar. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const NAV_CLIENT = [
    "sp",
    "ce",
    "rating",
    "indicatori",
    "vendite",
    "budget",
    "bep",
    "investimenti",
    "cashflow",
  ];
  // Bilancio, CE, Rating e Indicatori mostrano tutti gli anni in colonna. Il selettore dell'anno di riferimento serve solo dove i calcoli dipendono da un anno (budget = anno + 1, ecc.)
  const REF_YEAR_PAGES = [
    "dashboard",
    "vendite",
    "budget",
    "bep",
    "investimenti",
    "cashflow",
    "report",
  ];
  let current = null; // { key, inst }

  GB.setConn = (ok) => {
    const d = document.getElementById("conn");
    if (d) d.classList.toggle("off", !ok);
    const t = document.getElementById("conn-t");
    if (t)
      t.textContent = ok ? "Database connesso" : "Server non raggiungibile";
  };

  /* ── tema ── */
  const store = {
    get() {
      try {
        return localStorage.getItem("gb.theme");
      } catch (e) {
        return null;
      }
    },
    set(t) {
      try {
        localStorage.setItem("gb.theme", t);
      } catch (e) {
        /* storage non disponibile: il tema vale per questa sessione */
      }
    },
  };
  const systemTheme = () =>
    matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const currentTheme = () =>
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  // persist = false quando il tema arriva dal sistema operativo (non è una scelta dell'utente)
  function applyTheme(t, persist = true, animate = false) {
    const root = document.documentElement;
    if (animate) {
      root.classList.add("theme-anim");
      setTimeout(() => root.classList.remove("theme-anim"), 350);
    }
    root.setAttribute("data-theme", t);
    if (persist) store.set(t);
    const l = document.getElementById("theme-label");
    if (l) l.textContent = t === "dark" ? "Tema scuro" : "Tema chiaro";
    const next = t === "dark" ? "chiaro" : "scuro";
    ["theme-btn", "theme-btn-top"].forEach((id) => {
      const b = document.getElementById(id);
      if (b) {
        b.setAttribute("aria-pressed", String(t === "dark"));
        b.title = "Passa al tema " + next;
      }
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
      meta.setAttribute("content", t === "dark" ? "#10131a" : "#f7f5f1");
  }
  const toggleTheme = () =>
    applyTheme(currentTheme() === "dark" ? "light" : "dark", true, true);

  /* ── sidebar ── */
  function buildNav() {
    const nav = document.getElementById("nav");
    const key = routeKey();
    const hasC = !!S.clienteId;
    const item = (k, icon, label, extra) =>
      h(
        "a",
        {
          class:
            "nav-item" +
            (key === k ? " active" : "") +
            (extra && extra.disabled ? " disabled" : ""),
          href: "#/" + k,
          onclick: () => document.body.classList.remove("nav-open"),
        },
        h("span", { class: "nav-icon" }, icon),
        label,
      );
    nav.replaceChildren(
      item("clienti", "👥", "Clienti"),
      item("dashboard", "📊", "Riepilogo cliente", { disabled: !hasC }),
      h(
        "div",
        { class: "nav-group" },
        hasC ? S.cliente.ragione_sociale.slice(0, 26) : "Bilancio",
      ),
      ...NAV_CLIENT.map((k) =>
        item(k, GB.pages[k].icon, GB.pages[k].title, { disabled: !hasC }),
      ),
      h("div", { class: "nav-sep" }),
      item("report", "🖨️", "Report completo", { disabled: !hasC }),
      h(
        "a",
        { class: "nav-item", href: "/api/download-db", download: "" },
        h("span", { class: "nav-icon" }, "💾"),
        "Scarica database",
      ),
    );
  }

  /* ── eliminazione anno con verifica dei dati ── */
  async function eliminaAnno(anno = S.anno) {
    if (S.anni.length <= 1) {
      GB.toast("Il cliente deve avere almeno un anno", "err");
      return;
    }
    let d;
    try {
      d = await GB.api.get(`/clienti/${S.clienteId}/anni/${anno}/dati`);
    } catch (e) {
      GB.toast(e.message, "err");
      return;
    }
    if (!d.ha_dati) {
      if (
        await GB.confirm(
          `L'anno ${anno} non contiene dati. Rimuoverlo dall'elenco?`,
          "Rimuovi",
        )
      )
        S.deleteAnno(anno, false).catch(() => {});
      return;
    }
    const body = h(
      "div",
      null,
      h(
        "p",
        null,
        `⚠️ L'anno ${anno} contiene ${d.totale} dati inseriti (bilancio, vendite, budget, cash flow). Eliminandolo si perdono definitivamente:`,
      ),
      GB.riepilogoDati(d),
      h(
        "p",
        { class: "small muted" },
        "Consiglio: scarica prima il database come backup.",
      ),
    );
    const r = await GB.modal({
      title: `Elimina l'anno ${anno}`,
      body,
      buttons: [
        { label: "Annulla", value: false },
        { label: "Elimina con i dati", kind: "danger", value: true },
      ],
    });
    if (r) S.deleteAnno(anno, true).catch(() => {});
  }
  GB.eliminaAnno = eliminaAnno; // usata anche dalle intestazioni delle colonne anno (SP / CE)

  /* ── topbar ── */
  function buildTopbar() {
    const key = routeKey();
    const page = GB.pages[key];
    document.getElementById("page-title").textContent = page
      ? S.cliente && !page.noClient
        ? page.title
        : page.title
      : "";
    const ctl = document.getElementById("ctl");
    const parts = [];
    const selC = GB.searchSelect({
      items: S.clienti.map((c) => ({
        value: c.id,
        label: c.ragione_sociale,
        sub: c.partita_iva || "",
      })),
      value: S.clienteId,
      emptyLabel: "— nessun cliente —",
      placeholder: "Cerca cliente…",
      onChange: async (v) => {
        await S.select(v || null);
      },
    });
    parts.push(
      h("div", { class: "topbar-ctl" }, h("label", null, "Cliente"), selC),
    );
    if (S.clienteId) {
      if (REF_YEAR_PAGES.includes(key)) {
        const selY = h(
          "select",
          { onchange: (e) => S.setYear(e.target.value) },
          S.anni.map((a) =>
            h(
              "option",
              { value: a, selected: a === S.anno || null },
              String(a),
            ),
          ),
        );
        parts.push(
          h(
            "div",
            {
              class: "topbar-ctl",
              title:
                "Esercizio di riferimento: il budget, il punto di pareggio, gli investimenti e il cash flow sono calcolati per l'anno successivo; le vendite usano questo e i 2 anni precedenti",
            },
            h("label", null, "Anno rif."),
            selY,
            h(
              "button",
              {
                class: "btn sm icon",
                title: "Aggiungi l'anno successivo",
                onclick: async () => {
                  try {
                    const a = await S.addAnno();
                    GB.toast("Anno " + a + " aggiunto");
                  } catch (e) {
                    /* toast già mostrato */
                  }
                },
              },
              "＋",
            ),
            h(
              "button",
              {
                class: "btn sm icon danger",
                title: "Elimina l'anno selezionato",
                onclick: () => eliminaAnno(),
              },
              "🗑",
            ),
          ),
        );
      }
      parts.push(
        h(
          "button",
          { class: "btn primary", onclick: () => window.print() },
          "🖨️ Stampa",
        ),
      );
    }
    ctl.replaceChildren(...parts);
  }

  /* ── routing ── */
  function routeKey() {
    const k = (location.hash || "").replace(/^#\//, "").split("?")[0];
    return GB.pages[k] ? k : S.clienteId ? "dashboard" : "clienti";
  }

  function render() {
    let key = routeKey();
    const page = GB.pages[key];
    if (!page.noClient && !S.clienteId) key = "clienti";
    const content = document.getElementById("content");
    const keepTop = content.scrollTop;
    // la posizione di scorrimento delle tabelle si conserva solo se si ridisegna la stessa pagina (non quando si cambia pagina)
    const inner =
      current && current.key === key
        ? [...content.querySelectorAll(".tbl-wrap")].map((e) => [
            e.scrollTop,
            e.scrollLeft,
          ])
        : [];
    const box = h("div", { class: "page", id: "page" });
    content.replaceChildren(box);
    buildNav();
    buildTopbar();
    const p = GB.pages[key];
    if (!p.noClient && !S.clienteId) {
      box.append(
        h(
          "div",
          { class: "empty" },
          h("div", { class: "big" }, "👥"),
          h("h2", null, "Seleziona un cliente"),
          h(
            "p",
            null,
            "Scegli un cliente dal menu in alto oppure creane uno nella pagina Clienti.",
          ),
        ),
      );
      current = null;
      return;
    }
    try {
      current = { key, inst: p.render(box, false) };
    } catch (e) {
      console.error(e);
      box.append(
        h(
          "div",
          { class: "note", style: { borderLeftColor: "var(--red)" } },
          "Errore nel rendering della pagina: " + e.message,
        ),
      );
      current = null;
    }
    content.scrollTop = keepTop;
    [...content.querySelectorAll(".tbl-wrap")].forEach((e, i) => {
      if (inner[i]) {
        e.scrollTop = inner[i][0];
        e.scrollLeft = inner[i][1];
      }
    });
    if (GB.focusVoce) {
      const el = content.querySelector(`.ci.desc[data-voce="${GB.focusVoce}"]`);
      if (el) el.focus();
      GB.focusVoce = null;
    }
  }

  S.on("context", render);
  S.on("structure", render);
  S.on("clienti", () => {
    buildTopbar();
    buildNav();
    if (routeKey() === "clienti") render();
  });
  S.on("calc", () => {
    if (current && current.inst && current.inst.update) current.inst.update();
  });
  window.addEventListener("hashchange", render);

  async function boot() {
    const saved0 = store.get();
    applyTheme(
      saved0 === "dark" || saved0 === "light" ? saved0 : systemTheme(),
      false,
    );
    document.getElementById("theme-btn").addEventListener("click", toggleTheme);
    document
      .getElementById("theme-btn-top")
      .addEventListener("click", toggleTheme);
    // se l'utente non ha mai scelto un tema, segue quello del sistema anche quando cambia
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onSys = () => {
      const s = store.get();
      if (s !== "dark" && s !== "light") applyTheme(systemTheme(), false, true);
    };
    if (mq.addEventListener) mq.addEventListener("change", onSys);
    else if (mq.addListener) mq.addListener(onSys);
    document
      .getElementById("menu-btn")
      .addEventListener("click", () =>
        document.body.classList.toggle("nav-open"),
      );
    try {
      await S.loadClienti();
      const saved = Number(localStorage.getItem("gb.cliente"));
      const target =
        S.clienti.find((c) => c.id === saved) ||
        (S.clienti.length === 1 ? S.clienti[0] : null);
      if (target) await S.select(target.id);
      else render();
    } catch (e) {
      GB.setConn(false);
      GB.toast(e.message, "err");
      render();
    }
  }
  boot();
})();
