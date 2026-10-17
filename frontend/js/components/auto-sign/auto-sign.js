/* Colori automatici: positivo verde, negativo rosso, in tutte le celle importo. */
(function () {
  const GB = window.GB;

  /* ───────── colori automatici: positivo verde / negativo rosso ─────────
     Vale per ogni cella importo (td.n), per le percentuali (solo negativo rosso)
     e per i KPI in euro. Si riapplica da solo quando le pagine ricalcolano i valori. */
  (function autoSign() {
    const paint = () => {
      document.querySelectorAll("td.n, td.pc, .kpi .v").forEach((el) => {
        if (el.querySelector("input,select")) return;
        const txt = el.textContent;
        let c = GB.signOf(txt);
        if (el.classList.contains("v") && txt.indexOf("€") === -1) c = "";
        if (el.classList.contains("pc") && c === "pos") c = "";
        const neg = c === "neg",
          pos = c === "pos";
        if (el.classList.contains("neg") !== neg) el.classList.toggle("neg", neg);
        if (el.classList.contains("pos") !== pos) el.classList.toggle("pos", pos);
      });
    };
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        paint();
      });
    };
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    schedule();
  })();
})();
