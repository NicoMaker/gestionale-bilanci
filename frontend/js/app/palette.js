/* Ricerca rapida «Vai a…» (Ctrl/⌘ + K): pagine, clienti e azioni. */
(function () {
  const GB = window.GB;
  const S = GB.store;

  const ov = document.createElement("div");
  ov.className = "cmdk-overlay no-print";
  ov.hidden = true;
  ov.innerHTML = `<div class="cmdk" role="dialog" aria-label="Vai a…">
    <div class="cmdk-head"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><input placeholder="Vai a una pagina o cerca un cliente…"/><kbd class="cmdk-esc" role="button" tabindex="0" title="Chiudi (Esc)">Esc</kbd></div>
    <ul class="cmdk-list"></ul>
    <div class="cmdk-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> naviga</span><span><kbd>↵</kbd> apri</span><span><kbd>Esc</kbd> chiudi</span></div></div>`;
  document.body.appendChild(ov);
  const input = ov.querySelector("input");
  const lista = ov.querySelector("ul");
  let voci = [];
  let mostrate = [];
  let idx = 0;

  const esc = (t) =>
    String(t).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );

  /* voci attuali: pagine attive del menu laterale + clienti + azioni */
  function costruisci() {
    const out = [];
    document.querySelectorAll("#nav a.nav-item:not(.disabled)").forEach((a) => {
      out.push({
        gruppo: "Pagine",
        icona: a.querySelector(".nav-icon")?.textContent.trim() || "",
        label: a.textContent.trim(),
        vai: () => a.click(),
      });
    });
    (S.clienti || []).forEach((c) =>
      out.push({
        gruppo: "Clienti",
        icona: "📂",
        label: c.ragione_sociale,
        sub: c.partita_iva || "",
        vai: async () => {
          await S.select(c.id);
          location.hash = "#/dashboard";
        },
      }),
    );
    out.push(
      {
        gruppo: "Azioni",
        icona: "🌓",
        label: "Tema chiaro / scuro",
        vai: () => GB.theme.toggle(),
      },
      {
        gruppo: "Azioni",
        icona: "⌨️",
        label: "Guida tasti da tastiera",
        vai: () => window.GB.apriGuidaTasti?.(),
      },
      {
        gruppo: "Azioni",
        icona: "🖨️",
        label: "Stampa la pagina",
        vai: () => window.print(),
      },
    );
    return out;
  }

  const norm = (t) =>
    String(t)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  function disegna() {
    let g = null;
    lista.innerHTML = mostrate.length
      ? mostrate
          .map((v, n) => {
            const testa =
              v.gruppo !== g
                ? `<li class="grp">${esc((g = v.gruppo))}</li>`
                : "";
            return `${testa}<li data-n="${n}" class="${n === idx ? "on" : ""}"><span>${v.icona}</span><span>${esc(v.label)}</span>${v.sub ? `<span class="sub">${esc(v.sub)}</span>` : ""}</li>`;
          })
          .join("")
      : '<li class="none">Nessun risultato</li>';
    lista.querySelector(".on")?.scrollIntoView?.({ block: "nearest" });
  }
  function filtra() {
    const q = norm(input.value.trim());
    const toks = q.split(/\s+/).filter(Boolean);
    mostrate = voci
      .filter((v) =>
        toks.every((t) => norm(v.label + " " + (v.sub || "")).includes(t)),
      )
      .slice(0, q ? 30 : 24);
    idx = 0;
    disegna();
  }
  function apri() {
    voci = costruisci();
    ov.hidden = false;
    input.value = "";
    filtra();
    input.focus();
  }
  const chiudi = () => (ov.hidden = true);
  const vai = (v) => {
    chiudi();
    if (v) v.vai();
  };

  input.addEventListener("input", filtra);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      idx =
        (idx + (e.key === "ArrowDown" ? 1 : -1) + mostrate.length) %
        (mostrate.length || 1);
      disegna();
    } else if (e.key === "Enter") vai(mostrate[idx]);
  });
  lista.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-n]");
    if (li) vai(mostrate[li.dataset.n]);
  });
  ov.addEventListener("mousedown", (e) => e.target === ov && chiudi());
  const escBtn = ov.querySelector(".cmdk-esc");
  escBtn.addEventListener("mousedown", (e) => e.preventDefault());
  escBtn.addEventListener("click", chiudi);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !ov.hidden) {
      e.preventDefault();
      chiudi();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      ov.hidden ? apri() : chiudi();
    }
  });

  const mac = /Mac|iPhone|iPad/.test(navigator.platform || "");
  const kbd = document.getElementById("cmdk-kbd");
  if (kbd) kbd.textContent = mac ? "⌘ K" : "Ctrl K";
  document.getElementById("cmdk-btn").addEventListener("click", apri);

  GB.apriRicerca = apri;
})();
