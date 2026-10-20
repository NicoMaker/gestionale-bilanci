/* Scorciatoie da tastiera + guida (pulsante «⌨ ?» o tasto ?). */
(function () {
  const GB = window.GB;
  const S = GB.store;

  // g + lettera → pagina
  const NAV = [
    ["h", "home", "Panoramica studio"],
    ["c", "clienti", "Clienti"],
    ["r", "dashboard", "Riepilogo cliente"],
    ["s", "sp", "Stato Patrimoniale"],
    ["e", "ce", "Conto Economico"],
    ["t", "rating", "Rating"],
    ["i", "indicatori", "Indicatori"],
    ["v", "vendite", "Vendite"],
    ["b", "budget", "Budget"],
    ["p", "bep", "Punto di pareggio (BEP)"],
    ["n", "investimenti", "Investimenti"],
    ["f", "cashflow", "Cash Flow"],
    ["o", "report", "Report completo"],
    ["x", "cestino", "Cestino"],
  ];
  const GENERALI = [
    [["?"], "Apri / chiudi questa guida"],
    [["t"], "Cambia tema chiaro / scuro"],
    [["/"], "Cerca nell'elenco clienti"],
    [["Esc"], "Chiude finestre e ricerca"],
  ];

  const ov = document.createElement("div");
  ov.className = "kb-overlay no-print";
  ov.hidden = true;
  const kb = (arr) => arr.map((k) => `<kbd>${k}</kbd>`).join("");
  ov.innerHTML = `<div class="kb-guida" role="dialog" aria-label="Guida tasti">
    <h2>⌨️ Scorciatoie da tastiera</h2>
    <p class="kb-sub">Non funzionano mentre stai scrivendo in un campo.</p>
    <h3>Generali</h3>
    ${GENERALI.map(([k, d]) => `<div class="kb-riga"><span class="k">${kb(k)}</span><span>${d}</span></div>`).join("")}
    <h3>Vai a… (premi <kbd>g</kbd> e poi la lettera)</h3>
    <div class="kb-griglia">${NAV.map(([k, , d]) => `<div class="kb-riga"><span class="k">${kb(["g", k])}</span><span>${d}</span></div>`).join("")}</div>
  </div>`;
  document.body.appendChild(ov);

  const apri = () => (ov.hidden = false);
  const chiudi = () => (ov.hidden = true);
  ov.addEventListener("mousedown", (e) => e.target === ov && chiudi());
  document
    .getElementById("kb-btn")
    .addEventListener("click", () => (ov.hidden ? apri() : chiudi()));
  GB.apriGuidaTasti = apri;

  const inCampo = (t) =>
    t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
  let attesaG = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !ov.hidden) return chiudi();
    if (e.ctrlKey || e.metaKey || e.altKey || inCampo(e.target)) return;
    if (document.querySelector(".modal-overlay.open")) return;
    const k = e.key;
    if (k === "?") {
      e.preventDefault();
      return ov.hidden ? apri() : chiudi();
    }
    if (!ov.hidden) return;
    if (attesaG && Date.now() - attesaG < 1500) {
      attesaG = 0;
      const v = NAV.find((n) => n[0] === k.toLowerCase());
      if (v) {
        e.preventDefault();
        const page = GB.pages[v[1]];
        if (page && (page.noClient || S.clienteId)) location.hash = "#/" + v[1];
        else GB.toast("Seleziona prima un cliente", "err");
      }
      return;
    }
    if (k === "g") attesaG = Date.now();
    else if (k === "t") GB.theme.toggle();
    else if (k === "/") {
      const q = document.querySelector(
        "#content input[type=search], #content .client-search input",
      );
      if (q) {
        e.preventDefault();
        q.focus();
      }
    }
  });
})();
