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
     Con editable: penna accanto e clic apre la finestra di modifica (campo data scrivibile + calendario, anno bloccato). */
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

  /* Finestra con il campo data: anno in grande (bloccato), data scrivibile o dal calendario, scorciatoie e anteprima.
     Restituisce {data} ("" = 31/12) oppure null se annullata. */
  GB.chiediData = async ({ title, anno, valore, conferma }) => {
    const penSvg = penna();
    penSvg.setAttribute("width", "15");
    penSvg.setAttribute("height", "15");
    const inp = h("input", {
      type: "date",
      value: valore || "",
      min: anno + "-01-01",
      max: anno + "-12-31",
      class: "inp-data",
      "aria-label": "Data di chiusura dell'esercizio " + anno,
    });
    const anteprima = h("div", { class: "dc-preview" });
    const scorciatoie = [
      ["31/12", "-12-31"],
      ["30/09", "-09-30"],
      ["30/06", "-06-30"],
      ["31/03", "-03-31"],
    ];
    const chips = scorciatoie.map(([lab, suf]) =>
      h(
        "button",
        {
          class: "dc-chip",
          type: "button",
          onclick: () => {
            inp.value = anno + suf;
            aggiorna();
          },
        },
        lab,
      ),
    );
    const aggiorna = () => {
      const v = inp.value;
      const iso = v || anno + "-12-31";
      chips.forEach((c, i) =>
        c.classList.toggle("on", iso === anno + scorciatoie[i][1]),
      );
      const d = new Date(iso + "T00:00:00");
      anteprima.textContent = isNaN(d)
        ? ""
        : "L'esercizio chiude " +
          d.toLocaleDateString("it-IT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }) +
          (v ? "" : " (predefinito)");
    };
    inp.addEventListener("input", aggiorna);
    inp.addEventListener("change", aggiorna);
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const ok = inp
          .closest(".modal")
          ?.querySelector(".modal-f .btn.primary");
        if (ok) ok.click();
      }
    });
    aggiorna();
    const ok = await GB.modal({
      title,
      body: h(
        "div",
        { class: "dc" },
        h(
          "div",
          { class: "dc-hero" },
          h("span", { class: "dc-kicker" }, "Esercizio"),
          h("span", { class: "dc-year" }, String(anno)),
        ),
        h("label", { class: "dc-label" }, "Data di chiusura ", penSvg),
        h("div", { class: "dc-field" }, inp),
        h("div", { class: "dc-chips" }, chips),
        anteprima,
        h(
          "p",
          { class: "small muted dc-hint" },
          `Scrivila o scegli dal calendario (solo giorni del ${anno}). Se resta vuota viene usato il 31/12/${anno}.`,
        ),
      ),
      buttons: [
        { label: "Annulla", value: false },
        { label: conferma, kind: "primary", value: true },
      ],
    });
    if (!ok) return null;
    const v = inp.value.trim();
    if (v && v.slice(0, 4) !== String(anno)) {
      GB.toast("La data deve essere nel " + anno, "err");
      return null;
    }
    return { data: v };
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
