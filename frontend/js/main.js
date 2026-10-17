/* Avvio dell'applicazione. */
(function () {
  const GB = window.GB;
  const S = GB.store;

  async function boot() {
    GB.theme.init();
    document.getElementById("menu-btn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
    try {
      await S.loadClienti();
      const saved = Number(localStorage.getItem("gb.cliente"));
      const target = S.clienti.find((c) => c.id === saved) || (S.clienti.length === 1 ? S.clienti[0] : null);
      if (target) await S.select(target.id); else GB.app.render();
    } catch (e) { GB.setConn(false); GB.toast(e.message, "err"); GB.app.render(); }
  }
  boot();
})();
