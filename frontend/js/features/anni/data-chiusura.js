/* Data di chiusura degli esercizi: lettura (stessa data in tutte le sezioni dello stesso cliente), etichette, modifica.
   Se non viene indicata una data l'esercizio chiude il 31/12 dell'anno. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const dataIt = (iso) => (iso ? String(iso).split("-").reverse().join("/") : "");

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

  /* Data sotto l'anno nelle intestazioni di colonna.
     Con editable: icona penna + clic apre direttamente il calendario (solo giorni dell'anno di riferimento, l'anno non si scrive). */
  GB.dataTag = (anno, editable) => {
    if (!editable)
      return h(
        "span",
        { class: "dt", title: "Data di chiusura dell'esercizio" },
        GB.dataChiusuraIt(anno),
      );
    // stessa data di sempre (gg/mm/aaaa) con sottolineatura tratteggiata: si scrive a mano oppure si sceglie dal calendario con la penna
    const ggmm = () => GB.dataChiusuraIt(anno);
    const inp = h("input", {
      type: "text",
      class: "dt-input",
      inputmode: "numeric",
      maxlength: 10,
      value: ggmm(),
      placeholder: "31/12/" + anno,
      title: "Data di chiusura dell'esercizio: scrivila (es. 30/06) o scegli dal calendario con la penna. Vuota = 31/12",
      "aria-label": "Data di chiusura dell'esercizio " + anno + " ",
    });
    const cal = h("input", {
      type: "date",
      class: "dt-picker",
      tabindex: "-1",
      "aria-hidden": "true",
      value: GB.dataChiusura(anno),
      min: anno + "-01-01",
      max: anno + "-12-31",
    });
    const salva = async (iso) => {
      try {
        const d = await S.saveDataChiusura(anno, iso);
        GB.toast(`Esercizio ${anno}: chiusura ${dataIt(d)}`);
      } catch (e) {
        inp.value = ggmm(); /* toast già mostrato */
      }
    };
    // «gg/mm» (o «gg/mm/aaaa» dello stesso anno) → AAAA-MM-GG; vuoto → ""; non valido → null
    const leggi = () => {
      const t = inp.value.trim();
      if (!t) return "";
      const m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?$/);
      if (!m) return null;
      const g = Number(m[1]);
      const mese = Number(m[2]);
      const aa = m[3] ? (m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])) : anno;
      const d = new Date(Date.UTC(aa, mese - 1, g));
      if (aa !== anno) return null;
      if (d.getUTCMonth() !== mese - 1 || d.getUTCDate() !== g) return null;
      return `${aa}-${String(mese).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
    };
    const conferma = () => {
      const iso = leggi();
      if (iso === null) {
        GB.toast("Data non valida: scrivi giorno e mese, es. 30/06", "err");
        inp.value = ggmm();
        return;
      }
      if ((iso || anno + "-12-31") === GB.dataChiusura(anno)) {
        inp.value = ggmm();
        return;
      }
      salva(iso);
    };
    inp.addEventListener("click", (e) => e.stopPropagation());
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        inp.blur();
      } else if (e.key === "Escape") {
        inp.value = ggmm();
        inp.blur();
      }
    });
    inp.addEventListener("change", conferma);
    cal.addEventListener("change", () => cal.value && salva(cal.value));
    const pen = penna();
    pen.addEventListener("click", (e) => {
      e.stopPropagation();
      cal.value = GB.dataChiusura(anno);
      try {
        cal.showPicker();
      } catch (_) {
        inp.focus();
      }
    });
    return h(
      "span",
      { class: "dt dt-edit" },
      inp,
      pen,
      cal,
      // solo per la stampa/PDF: il campo si nasconde e resta il testo
      h("span", { class: "dt-print" }, GB.dataChiusuraIt(anno)),
    );
  };

  /* Finestra con il campo data. Restituisce {data} ("" = 31/12) oppure null se annullata. */
  GB.chiediData = async ({ title, anno, valore, conferma }) => {
    const inp = h("input", {
      type: "date",
      value: valore || "",
      min: anno + "-01-01",
      max: anno + "-12-31",
      class: "inp-data",
      "aria-label": "Data di chiusura dell'esercizio " + anno,
    });
    const ok = await GB.modal({
      title,
      body: h(
        "div",
        null,
        h("p", null, "Data di chiusura dell'esercizio " + anno + ":"),
        h(
          "div",
          { class: "data-chiusura-row" },
          inp,
          h(
            "button",
            {
              class: "btn sm",
              type: "button",
              onclick: () => (inp.value = anno + "-12-31"),
            },
            "31/12",
          ),
        ),
        h(
          "p",
          { class: "small muted" },
          `Se lasci il campo vuoto viene usato il 31/12/${anno}.`,
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
    const anno = (S.anni.length ? Math.max(...S.anni) : new Date().getFullYear() - 1) + 1;
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
