/* Avvio, routing (hash), sidebar, topbar. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const NAV_CLIENT = ["sp", "ce", "rating", "indicatori", "vendite", "budget", "bep", "investimenti", "cashflow"];
  let current = null; // { key, inst }

  GB.setConn = (ok) => { const d = document.getElementById("conn"); if (d) d.classList.toggle("off", !ok); const t = document.getElementById("conn-t"); if (t) t.textContent = ok ? "Database connesso" : "Server non raggiungibile"; };

  /* ── tema ── */
  function applyTheme(t) { document.documentElement.setAttribute("data-theme", t); localStorage.setItem("gb.theme", t); const l = document.getElementById("theme-label"); if (l) l.textContent = t === "dark" ? "Tema scuro" : "Tema chiaro"; }

  /* ── sidebar ── */
  function buildNav() {
    const nav = document.getElementById("nav");
    const key = routeKey();
    const hasC = !!S.clienteId;
    const item = (k, icon, label, extra) => h("a", { class: "nav-item" + (key === k ? " active" : "") + (extra && extra.disabled ? " disabled" : ""), href: "#/" + k, onclick: () => document.body.classList.remove("nav-open") },
      h("span", { class: "nav-icon" }, icon), label);
    nav.replaceChildren(
      item("clienti", "👥", "Clienti"),
      item("dashboard", "📊", "Riepilogo cliente", { disabled: !hasC }),
      h("div", { class: "nav-group" }, hasC ? S.cliente.ragione_sociale.slice(0, 26) : "Bilancio"),
      ...NAV_CLIENT.map((k) => item(k, GB.pages[k].icon, GB.pages[k].title, { disabled: !hasC })),
      h("div", { class: "nav-sep" }),
      item("report", "🖨️", "Report completo", { disabled: !hasC }),
      h("a", { class: "nav-item", href: "/api/download-db", download: "" }, h("span", { class: "nav-icon" }, "💾"), "Scarica database"));
  }

  /* ── eliminazione anno con verifica dei dati ── */
  async function eliminaAnno() {
    if (S.anni.length <= 1) { GB.toast("Il cliente deve avere almeno un anno", "err"); return; }
    const anno = S.anno;
    let d;
    try { d = await GB.api.get(`/clienti/${S.clienteId}/anni/${anno}/dati`); } catch (e) { GB.toast(e.message, "err"); return; }
    if (!d.ha_dati) {
      if (await GB.confirm(`L'anno ${anno} non contiene dati. Rimuoverlo dall'elenco?`, "Rimuovi")) S.deleteAnno(anno, false).catch(() => {});
      return;
    }
    const body = h("div", null, h("p", null, `⚠️ L'anno ${anno} contiene ${d.totale} dati inseriti (bilancio, vendite, budget, cash flow). Eliminandolo si perdono definitivamente:`),
      GB.riepilogoDati(d), h("p", { class: "small muted" }, "Consiglio: scarica prima il database come backup."));
    const r = await GB.modal({ title: `Elimina l'anno ${anno}`, body, buttons: [{ label: "Annulla", value: false }, { label: "Elimina con i dati", kind: "danger", value: true }] });
    if (r) S.deleteAnno(anno, true).catch(() => {});
  }

  /* ── topbar ── */
  function buildTopbar() {
    const key = routeKey();
    const page = GB.pages[key];
    document.getElementById("page-title").textContent = page ? (S.cliente && !page.noClient ? page.title : page.title) : "";
    const ctl = document.getElementById("ctl");
    const parts = [];
    const selC = h("select", { onchange: async (e) => { await S.select(Number(e.target.value) || null); } },
      h("option", { value: "" }, "— cliente —"), S.clienti.map((c) => h("option", { value: c.id, selected: c.id === S.clienteId || null }, c.ragione_sociale)));
    parts.push(h("div", { class: "topbar-ctl" }, h("label", null, "Cliente"), selC));
    if (S.clienteId) {
      const selY = h("select", { onchange: (e) => S.setYear(e.target.value) }, S.anni.map((a) => h("option", { value: a, selected: a === S.anno || null }, String(a))));
      parts.push(h("div", { class: "topbar-ctl", title: "Esercizio di riferimento: si vedono i 3 anni fino a questo e il budget dell'anno successivo" }, h("label", null, "Anno"), selY,
        h("button", { class: "btn sm icon", title: "Aggiungi l'anno successivo", onclick: async () => { try { const a = await S.addAnno(); GB.toast("Anno " + a + " aggiunto"); } catch (e) { /* toast già mostrato */ } } }, "＋"),
        h("button", { class: "btn sm icon danger", title: "Elimina l'anno selezionato", onclick: eliminaAnno }, "🗑")));
      parts.push(h("button", { class: "btn primary", onclick: () => window.print() }, "🖨️ Stampa"));
    }
    ctl.replaceChildren(...parts);
  }

  /* ── routing ── */
  function routeKey() { const k = (location.hash || "").replace(/^#\//, "").split("?")[0]; return GB.pages[k] ? k : S.clienteId ? "dashboard" : "clienti"; }

  function render() {
    let key = routeKey();
    const page = GB.pages[key];
    if (!page.noClient && !S.clienteId) key = "clienti";
    const content = document.getElementById("content");
    const keepTop = content.scrollTop;
    const inner = [...content.querySelectorAll(".tbl-wrap")].map((e) => [e.scrollTop, e.scrollLeft]);
    const box = h("div", { class: "page", id: "page" });
    content.replaceChildren(box);
    buildNav(); buildTopbar();
    const p = GB.pages[key];
    if (!p.noClient && !S.clienteId) {
      box.append(h("div", { class: "empty" }, h("div", { class: "big" }, "👥"), h("h2", null, "Seleziona un cliente"), h("p", null, "Scegli un cliente dal menu in alto oppure creane uno nella pagina Clienti.")));
      current = null; return;
    }
    try { current = { key, inst: p.render(box, false) }; }
    catch (e) { console.error(e); box.append(h("div", { class: "note", style: { borderLeftColor: "var(--red)" } }, "Errore nel rendering della pagina: " + e.message)); current = null; }
    content.scrollTop = keepTop;
    [...content.querySelectorAll(".tbl-wrap")].forEach((e, i) => { if (inner[i]) { e.scrollTop = inner[i][0]; e.scrollLeft = inner[i][1]; } });
    if (GB.focusVoce) { const el = content.querySelector(`.ci.desc[data-voce="${GB.focusVoce}"]`); if (el) el.focus(); GB.focusVoce = null; }
  }

  S.on("context", render);
  S.on("structure", render);
  S.on("clienti", () => { buildTopbar(); buildNav(); if (routeKey() === "clienti") render(); });
  S.on("calc", () => { if (current && current.inst && current.inst.update) current.inst.update(); });
  window.addEventListener("hashchange", render);

  async function boot() {
    applyTheme(localStorage.getItem("gb.theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
    document.getElementById("theme-btn").addEventListener("click", () => applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));
    document.getElementById("menu-btn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
    try {
      await S.loadClienti();
      const saved = Number(localStorage.getItem("gb.cliente"));
      const target = S.clienti.find((c) => c.id === saved) || (S.clienti.length === 1 ? S.clienti[0] : null);
      if (target) await S.select(target.id); else render();
    } catch (e) { GB.setConn(false); GB.toast(e.message, "err"); render(); }
  }
  boot();
})();
