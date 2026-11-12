/* Routing (hash) e disegno della pagina corrente. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  let current = null; // { key, inst }
  /* ── routing ── */
  function routeKey() {
    const k = (location.hash || "").replace(/^#\//, "").split("?")[0];
    const p = GB.pages[k];
    // pagina inesistente, o che richiede un cliente quando non ce n'è uno selezionato → Panoramica
    if (!p || (!p.noClient && !S.clienteId)) return "home";
    return k;
  }

  function render() {
    const key = routeKey();
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
    GB.app.buildNav();
    GB.app.buildTopbar();
    const p = GB.pages[key];
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
    GB.app.buildTopbar();
    GB.app.buildNav();
    if (["clienti", "home"].includes(routeKey())) render();
  });
  S.on("calc", () => {
    if (current && current.inst && current.inst.update) current.inst.update();
  });
  window.addEventListener("hashchange", render);

  GB.routeKey = routeKey;
  GB.app = GB.app || {};
  GB.app.render = render;
})();
