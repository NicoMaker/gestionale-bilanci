/* Tema chiaro/scuro: scelta salvata, tema di sistema, pulsanti. */
(function () {
  const GB = window.GB;

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

  GB.theme = {
    init() {
      const saved0 = store.get();
      applyTheme(
        saved0 === "dark" || saved0 === "light" ? saved0 : systemTheme(),
        false,
      );
      document
        .getElementById("theme-btn")
        .addEventListener("click", toggleTheme);
      document
        .getElementById("theme-btn-top")
        .addEventListener("click", toggleTheme);
      // se l'utente non ha mai scelto un tema, segue quello del sistema anche quando cambia
      const mq = matchMedia("(prefers-color-scheme: dark)");
      const onSys = () => {
        const s = store.get();
        if (s !== "dark" && s !== "light")
          applyTheme(systemTheme(), false, true);
      };
      if (mq.addEventListener) mq.addEventListener("change", onSys);
      else if (mq.addListener) mq.addListener(onSys);
    },
    apply: applyTheme,
    toggle: toggleTheme,
  };
})();
