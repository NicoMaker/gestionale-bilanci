/* Data di chiusura degli esercizi: lettura (stessa data in tutte le sezioni dello stesso cliente), etichette, modifica.
   Se non viene indicata una data l'esercizio chiude il 31/12 dell'anno. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const dataIt = (iso) =>
    iso ? String(iso).split("-").reverse().join("/") : "";

  // data di chiusura (AAAA-MM-GG) dell'esercizio del cliente selezionato; default 31/12
  GB.dataChiusura = (anno) =>
    ((S.ds && S.ds.par && S.ds.par[anno]) || {}).data_chiusura ||
    anno + "-12-31";
  GB.dataIt = dataIt;
  GB.dataChiusuraIt = (anno) => dataIt(GB.dataChiusura(anno));

  // «2025 (31/12/2025) · 2024 (30/06/2024)» per le intestazioni di stampa e il report
  GB.eserciziTxt = (years) =>
    "Esercizi " +
    years.map((a) => `${a} (chiusura ${GB.dataChiusuraIt(a)})`).join(" · ");
  GB.esercizioTxt = (a) => `${a} (chiuso il ${GB.dataChiusuraIt(a)})`;

  // icona penna: indica che la data si può modificare
  const penna = () => {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "11");
    svg.setAttribute("height", "11");
    svg.setAttribute("class", "dt-pen");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(ns, "path");
    path.setAttribute(
      "d",
      "M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    );
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
    return svg;
  };

  /* Data sotto l'anno nelle intestazioni di colonna: si vede solo «gg/mm» (l'anno è già scritto sopra).
     Con editable: penna accanto e clic apre la finestra di modifica (giorno e mese scrivibili con anno automatico + calendario + «↺ 31/12»). */
  GB.dataTag = (anno, editable) => {
    const gm = GB.dataChiusuraIt(anno).slice(0, 5);
    if (!editable)
      return h(
        "span",
        {
          class: "dt",
          title: "Data di chiusura dell'esercizio " + GB.dataChiusuraIt(anno),
        },
        gm,
      );
    return h(
      "span",
      {
        class: "dt dt-edit",
        role: "button",
        tabindex: "0",
        title:
          "Data di chiusura dell'esercizio " +
          GB.dataChiusuraIt(anno) +
          ": clic per modificarla",
        onclick: (e) => {
          e.stopPropagation();
          GB.modificaDataChiusura(anno);
        },
        onkeydown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.currentTarget.click();
          }
        },
      },
      gm,
      penna(),
    );
  };

  /* Finestra con il campo data: anno in grande (bloccato), si scrive solo giorno e mese (l'anno si scrive da solo) o si sceglie dal calendario,
     scorciatoie, «↺ 31/12» per tornare alla data automatica e anteprima.
     Restituisce {data} ("" = 31/12) oppure null se annullata. */
  GB.chiediData = async ({ title, anno, valore, conferma }) => {
    const penSvg = penna();
    penSvg.setAttribute("width", "15");
    penSvg.setAttribute("height", "15");
    const anteprima = h("div", { class: "dc-preview" });
    const scorciatoie = [
      ["31/12", "-12-31"],
      ["30/09", "-09-30"],
      ["30/06", "-06-30"],
      ["31/03", "-03-31"],
    ];
    let campo;
    const reset = GB.resetDataBtn({
      title: "Reimposta: la data di chiusura torna al 31/12 (automatica)",
      onclick: () => {
        campo.reset();
        campo.input.focus();
      },
    });
    const chips = scorciatoie.map(([lab, suf]) =>
      h(
        "button",
        {
          class: "dc-chip",
          type: "button",
          onclick: () => campo.set(anno + suf),
        },
        lab,
      ),
    );
    const aggiorna = () => {
      const v = campo ? campo.get(false) : "";
      const iso = v === null ? null : v || anno + "-12-31";
      chips.forEach((c, i) =>
        c.classList.toggle("on", iso === anno + scorciatoie[i][1]),
      );
      reset.disabled = campo ? campo.vuoto() : true;
      const d = iso ? new Date(iso + "T00:00:00") : null;
      anteprima.textContent =
        !d || isNaN(d)
          ? ""
          : "L'esercizio chiude " +
            d.toLocaleDateString("it-IT", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }) +
            (v ? "" : " (31/12 in automatico)");
    };
    campo = GB.campoData({
      anno,
      valore: valore === anno + "-12-31" ? "" : valore,
      nascondiAnno: true, // l'anno è già scritto in grande sopra
      onChange: aggiorna,
      etichetta: "Data di chiusura dell'esercizio " + anno,
    });
    campo.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const ok = campo.input
          .closest(".modal")
          ?.querySelector(".modal-f .btn.primary");
        if (ok) ok.click();
      }
    });
    aggiorna();
    const body = h(
      "div",
      { class: "dc" },
      h(
        "div",
        { class: "dc-hero" },
        h("span", { class: "dc-kicker" }, "Esercizio"),
        h("span", { class: "dc-year" }, String(anno)),
      ),
      h(
        "div",
        { class: "dc-labelrow" },
        h("label", { class: "dc-label" }, "Data di chiusura ", penSvg),
        reset,
      ),
      h("div", { class: "dc-field" }, campo.el),
      h("div", { class: "dc-chips" }, chips),
      anteprima,
      h(
        "p",
        { class: "small muted dc-hint" },
        `Scrivi solo giorno e mese (es. 30/06): l'anno ${anno} è già quello dell'esercizio. Se resta vuota viene usato il 31/12/${anno}.`,
      ),
    );
    for (;;) {
      const ok = await GB.modal({
        title,
        body,
        buttons: [
          { label: "Annulla", value: false },
          { label: conferma, kind: "primary", value: true },
        ],
      });
      if (!ok) return null;
      const v = campo.get(true); // data non valida: avviso e la finestra si riapre
      if (v !== null) return { data: v };
    }
  };

  GB.modificaDataChiusura = async (anno) => {
    const r = await GB.chiediData({
      title: "Data di chiusura " + anno,
      anno,
      valore: GB.dataChiusura(anno),
      conferma: "Salva",
    });
    if (!r) return;
    try {
      const d = await S.saveDataChiusura(anno, r.data);
      GB.toast(`Esercizio ${anno}: chiusura ${dataIt(d)}`);
    } catch (e) {
      /* toast già mostrato */
    }
  };

  /* Penna a fine riga d'intestazione: un solo form con la data di chiusura di tutti gli esercizi mostrati. */
  GB.penDateChiusura = (years) =>
    GB.penBtn({
      title: "Modifica le date di chiusura di tutti gli esercizi",
      onclick: () => GB.modificaDateChiusura(years),
    });

  /* Una sola finestra con le date di tutti gli esercizi mostrati: ogni anno ha il suo campo (anno automatico) e il suo «↺ 31/12»;
     in alto «↺ Tutte al 31/12» riporta tutti gli esercizi alla data automatica. */
  GB.modificaDateChiusura = async (years) => {
    const anni = years.filter((a) => S.anni.includes(a));
    if (!anni.length) return;
    const campi = {};
    const resets = {};
    const aggiorna = () => {
      anni.forEach((a) => (resets[a].disabled = campi[a].vuoto()));
      tutte.disabled = anni.every((a) => campi[a].vuoto());
    };
    const tutte = GB.resetDataBtn({
      label: " Tutte al 31/12",
      title: "Riporta la data di chiusura di tutti gli esercizi al 31/12",
      onclick: () => {
        anni.forEach((a) => campi[a].reset());
        aggiorna();
      },
    });
    const grid = h("div", { class: "dcm-grid" });
    anni.forEach((a) => {
      const v = GB.dataChiusura(a);
      campi[a] = GB.campoData({
        anno: a,
        valore: v === a + "-12-31" ? "" : v,
        compatto: true,
        nascondiAnno: true, // l'anno è già scritto a sinistra
        onChange: aggiorna,
        etichetta: "Data di chiusura dell'esercizio " + a,
      });
      resets[a] = GB.resetDataBtn({
        label: " 31/12",
        title: `Esercizio ${a}: torna al 31/12`,
        onclick: () => campi[a].reset(),
      });
      grid.append(
        h("span", { class: "dcm-anno" }, String(a)),
        campi[a].el,
        resets[a],
      );
    });
    aggiorna();
    const body = h(
      "div",
      null,
      h(
        "div",
        { class: "dcm-top" },
        h(
          "p",
          { class: "edit-intro" },
          "Per ogni esercizio scrivi solo giorno e mese (l'anno si aggiunge da solo) o scegli dal calendario. Vuota = 31/12.",
        ),
        tutte,
      ),
      grid,
    );
    let mappa;
    for (;;) {
      const ok = await GB.modal({
        title: "Modifica riga — Date di chiusura",
        body,
        wide: anni.length > 3,
        buttons: [
          { label: "Annulla", value: false },
          { label: "Salva", kind: "primary", value: true },
        ],
      });
      if (!ok) return;
      mappa = {};
      let errore = false;
      for (const a of anni) {
        const v = campi[a].get(true);
        if (v === null) {
          errore = true;
          break;
        }
        if ((v || a + "-12-31") !== GB.dataChiusura(a)) mappa[a] = v;
      }
      if (!errore) break;
    }
    if (!Object.keys(mappa).length) return;
    try {
      await S.saveDateChiusura(mappa);
      GB.toast("Date di chiusura salvate");
    } catch (e) {
      /* toast già mostrato */
    }
  };

  GB.aggiungiAnno = async () => {
    const anno =
      (S.anni.length ? Math.max(...S.anni) : new Date().getFullYear() - 1) + 1;
    const r = await GB.chiediData({
      title: "Aggiungi esercizio " + anno,
      anno,
      valore: "",
      conferma: "Aggiungi",
    });
    if (!r) return;
    try {
      const a = await S.addAnno(anno, r.data);
      GB.toast(`Anno ${a} aggiunto (chiusura ${GB.dataChiusuraIt(a)})`);
    } catch (e) {
      /* toast già mostrato */
    }
  };
})();
