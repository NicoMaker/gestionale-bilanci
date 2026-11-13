/* Campo «data di chiusura» con anno automatico.
   Si scrive solo giorno e mese (es. 30/06 oppure 3006): l'anno dell'esercizio è sempre visibile accanto, già scritto e non modificabile,
   così la data non può uscire dall'anno. A destra il calendario (limitato ai giorni dell'anno).
   nascondiAnno: non mostra «/2025» accanto (quando l'anno è già scritto vicino, es. nelle finestre di modifica).
   Campo vuoto = data predefinita: 31/12 dell'anno.

   GB.campoData({ anno, valore?, testo?, compatto?, nascondiAnno?, onChange?, etichetta? }) → {
     el,            nodo da inserire nella pagina
     input,         campo di testo gg/mm (per focus, Invio…)
     get(avvisa)    "" (vuoto = 31/12) | "AAAA-MM-GG" | null se non valida (con avviso se avvisa = true)
     set(iso)       imposta da AAAA-MM-GG ("" = vuoto)
     setTesto(gg/mm)
     testo()        testo scritto, es. "30/06"
     setAnno(anno)  cambia l'anno mostrato e consentito
     reset()        svuota il campo → 31/12 in automatico
     vuoto()        true se il campo è vuoto (cioè 31/12 in automatico)
   } */
(function () {
  const GB = window.GB;
  const { h } = GB;

  const due = (n) => String(n).padStart(2, "0");

  // icona calendario
  const iconaCal = () => {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    const p = document.createElementNS(ns, "path");
    p.setAttribute(
      "d",
      "M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm-2 8h14v9H5v-9z",
    );
    p.setAttribute("fill", "currentColor");
    svg.appendChild(p);
    return svg;
  };

  /* Porta quello che l'utente scrive (o incolla) al formato «gg/mm».
     Accetta cifre di fila (3006), separatori / . - o spazio, una data completa (30/06/2025 o 2025-06-30: l'anno viene ignorato,
     vale sempre quello dell'esercizio). Il «/» si aggiunge da solo dopo il giorno. */
  const formatta = (raw, cancellando) => {
    let v = String(raw || "").trim();
    const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) return `${due(iso[3])}/${due(iso[2])}`;
    const sep = v.match(/^(\d{1,2})[\/.\-\s]+(\d{0,2})/);
    if (sep) {
      const g = sep[1].length === 1 ? "0" + sep[1] : sep[1];
      return g + "/" + sep[2];
    }
    const d = v.replace(/\D/g, "").slice(0, 4);
    if (d.length < 2) return d;
    if (d.length === 2) return cancellando ? d : d + "/";
    return d.slice(0, 2) + "/" + d.slice(2);
  };

  GB.campoData = function ({
    anno,
    valore,
    testo,
    compatto,
    nascondiAnno,
    onChange,
    etichetta,
  }) {
    let a = Number(anno) || null;
    let ultimo = ""; // ultimo valore, per capire se si sta cancellando

    const input = h("input", {
      type: "text",
      inputmode: "numeric",
      autocomplete: "off",
      spellcheck: "false",
      maxlength: 10,
      class: "dcamp-in",
      placeholder: "31/12",
      "aria-label":
        etichetta || "Data di chiusura (giorno e mese: l'anno è automatico)",
      title:
        "Scrivi solo giorno e mese (es. 30/06): l'anno è già indicato. Vuoto = 31/12",
    });
    const suffisso = h("span", { class: "dcamp-anno", "aria-hidden": "true" });
    const cal = h("input", {
      type: "date",
      class: "dcamp-picker",
      tabindex: "-1",
      "aria-hidden": "true",
    });
    const bCal = h(
      "button",
      {
        type: "button",
        class: "dcamp-cal",
        title: "Scegli dal calendario",
        "aria-label": "Scegli la data dal calendario",
        onclick: () => {
          if (!a) return GB.toast("Indica prima un anno valido", "err");
          const iso = leggi(false);
          cal.value = iso || "";
          try {
            cal.showPicker();
          } catch (_) {
            input.focus();
          }
        },
      },
      iconaCal(),
    );
    const el = h(
      "span",
      {
        class:
          "dcamp" +
          (compatto ? " compatto" : "") +
          (nascondiAnno ? " senza-anno" : ""),
      },
      input,
      suffisso,
      bCal,
      cal,
    );

    const disegna = () => {
      suffisso.textContent = "/" + (a || "aaaa");
      el.classList.toggle("vuoto", !input.value);
      cal.min = a ? a + "-01-01" : "";
      cal.max = a ? a + "-12-31" : "";
    };
    const cambiato = () => {
      disegna();
      el.classList.remove("errore");
      if (onChange) onChange();
    };

    /* "" | "AAAA-MM-GG" | null (non valida) */
    function leggi(avvisa) {
      const t = input.value.trim();
      if (!t) return "";
      const m = t.match(/^(\d{1,2})\/(\d{1,2})$/);
      let errore = "";
      if (!a) errore = "Indica prima un anno valido (1990–2100)";
      else if (!m) errore = "Data non valida: scrivi giorno e mese, es. 30/06";
      else {
        const g = Number(m[1]);
        const mese = Number(m[2]);
        const d = new Date(Date.UTC(a, mese - 1, g));
        if (
          d.getUTCFullYear() !== a ||
          d.getUTCMonth() !== mese - 1 ||
          d.getUTCDate() !== g
        )
          errore = `Data inesistente nel ${a}`;
        else return `${a}-${due(mese)}-${due(g)}`;
      }
      el.classList.add("errore");
      if (avvisa) GB.toast(errore, "err");
      return null;
    }

    input.addEventListener("keydown", (e) => {
      // dopo «gg/mm» il tasto Backspace toglie l'ultima cifra (l'anno non si cancella)
      ultimo = input.value;
      if (e.key === "Backspace" && /\/$/.test(input.value))
        ultimo = input.value.slice(0, -1);
    });
    input.addEventListener("input", (e) => {
      const cancellando =
        (e.inputType || "").startsWith("delete") ||
        input.value.length < ultimo.length;
      input.value = formatta(input.value, cancellando);
      cambiato();
    });
    // uscendo dal campo: «3/6» diventa «03/06»
    input.addEventListener("blur", () => {
      const m = input.value.trim().match(/^(\d{1,2})\/(\d{1,2})$/);
      if (m) {
        input.value = `${due(m[1])}/${due(m[2])}`;
        cambiato();
      }
    });
    cal.addEventListener("change", () => {
      if (!cal.value) return;
      const [, mm, gg] = cal.value.split("-");
      input.value = `${gg}/${mm}`;
      cambiato();
    });

    const api = {
      el,
      input,
      get: leggi,
      testo: () => input.value.trim(),
      vuoto: () => !input.value.trim(),
      set(iso) {
        const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
        input.value = m && Number(m[1]) === a ? `${m[3]}/${m[2]}` : "";
        cambiato();
      },
      setTesto(t) {
        input.value = formatta(t || "", true);
        cambiato();
      },
      setAnno(nuovo) {
        const n = Number(nuovo);
        a = Number.isInteger(n) && n >= 1990 && n <= 2100 ? n : null;
        cambiato();
      },
      reset() {
        input.value = "";
        cambiato();
      },
    };
    // valore iniziale: senza chiamare onChange (il chiamante non ha ancora finito di costruire la finestra)
    if (testo) input.value = formatta(testo, true);
    else {
      const m = String(valore || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m && Number(m[1]) === a) input.value = `${m[3]}/${m[2]}`;
    }
    disegna();
    return api;
  };

  /* Pulsante «↺ 31/12»: riporta la data al valore automatico (31/12). */
  GB.resetDataBtn = ({ title, label, onclick }) =>
    h(
      "button",
      {
        type: "button",
        class: "dcamp-reset",
        title: title || "Reimposta: la data di chiusura torna al 31/12",
        onclick,
      },
      h("span", { "aria-hidden": "true" }, "↺"),
      label === undefined ? " 31/12" : label,
    );
})();
