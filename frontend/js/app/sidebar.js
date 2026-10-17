/* Barra laterale: voci di navigazione. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;
  const routeKey = () => GB.routeKey();

  const NAV_CLIENT = ["sp", "ce", "rating", "indicatori", "vendite", "budget", "bep", "investimenti", "cashflow"];

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


  GB.app = GB.app || {};
  GB.app.buildNav = buildNav;
})();
