/* Navigazione tipo Excel nelle celle (Invio / frecce su-giù). */
(function () {
  const GB = window.GB;

  // Navigazione tipo Excel: Invio / ↓ → riga sotto, ↑ → riga sopra (stessa colonna `data-col`)
  GB.gridNav = function (root) {
    root.addEventListener("keydown", (e) => {
      const t = e.target;
      if (!t.classList || !t.classList.contains("ci")) return;
      if (!["Enter", "ArrowDown", "ArrowUp"].includes(e.key)) return;
      if (t.tagName === "SELECT" && e.key !== "Enter") return;
      const col = t.dataset.col;
      if (!col) return;
      const all = [
        ...root.querySelectorAll(
          `.ci[data-col="${col}"]:not([readonly]):not([disabled])`,
        ),
      ];
      const i = all.indexOf(t);
      const next = all[e.key === "ArrowUp" ? i - 1 : i + 1];
      e.preventDefault();
      if (next) next.focus();
    });
  };
})();
