/* Selezione multipla dei clienti: stato (id selezionati), barra azioni («Crea esercizio» per più clienti con anno e data di chiusura (vuota = 31/12), «Elimina selezionati») e aggiornamento della casella «seleziona tutti». */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.clienti.selezione = function (S) {
    // la selezione sopravvive ai ridisegni della pagina; si tolgono gli id di clienti non più esistenti
    const ids = (GB.clientiSel = GB.clientiSel || new Set());
    const esistenti = new Set(S.clienti.map((c) => c.id));
    [...ids].forEach((id) => esistenti.has(id) || ids.delete(id));

    const A = GB.parts.clienti.azioni;
    // anno proposto in automatico: l'anno successivo all'ultimo esercizio dei clienti selezionati (o di tutti se nessuno)
    const prossimoAnno = () => {
      const base = S.clienti.filter((c) => ids.has(c.id));
      const anniTutti = (base.length ? base : S.clienti).flatMap(
        (c) => c.anni || [],
      );
      return anniTutti.length
        ? Math.max(...anniTutti) + 1
        : new Date().getFullYear();
    };
    const conteggio = h("span", { class: "sel-count" });
    const anno = h("input", {
      type: "number",
      min: 1990,
      max: 2100,
      value: GB.clientiSelAnno || prossimoAnno(),
      class: "sel-anno",
      "aria-label": "Anno dell'esercizio da creare",
      title: "Anno dell'esercizio da creare per i clienti selezionati",
    });
    // data di chiusura dell'esercizio: si scrive solo giorno e mese (gg/mm, l'anno è quello del campo «Anno»)
    // oppure si sceglie dal calendario; se resta vuota viene usato il 31/12 dell'anno
    const data = h("input", {
      type: "text",
      inputmode: "numeric",
      maxlength: 10,
      placeholder: "31/12",
      value: GB.clientiSelData || "",
      class: "sel-anno sel-data",
      "aria-label": "Data di chiusura dell'esercizio (gg/mm, vuota = 31/12)",
      title:
        "Scrivi giorno e mese (es. 30/06): l'anno è quello indicato accanto. Vuota = 31/12",
    });
    const cal = h("input", {
      type: "date",
      class: "sel-cal",
      tabindex: "-1",
      "aria-hidden": "true",
    });
    const pen = h(
      "button",
      {
        type: "button",
        class: "sel-pen",
        title: "Scegli la data dal calendario",
        "aria-label": "Scegli la data dal calendario",
        onclick: () => {
          limitiData();
          const iso = leggiData(false);
          cal.value = iso || "";
          try {
            cal.showPicker();
          } catch (_) {
            data.focus();
          }
        },
      },
      "✎",
    );
    const annoValido = () => {
      const a = Number(anno.value);
      return Number.isInteger(a) && a >= 1990 && a <= 2100 ? a : null;
    };
    /* Legge il campo: "gg/mm" (o "gg/mm/aaaa" dell'anno scelto) → AAAA-MM-GG; vuoto → ""; non valido → null (con avviso se avvisa). */
    const leggiData = (avvisa) => {
      const t = data.value.trim();
      if (!t) return "";
      const a = annoValido();
      const m = t.match(/^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?$/);
      let errore = "";
      if (!a) errore = "Indica prima un anno valido (1990–2100)";
      else if (!m) errore = "Data non valida: scrivi giorno e mese, es. 30/06";
      else {
        const g = Number(m[1]);
        const mese = Number(m[2]);
        const aa = m[3]
          ? m[3].length === 2
            ? 2000 + Number(m[3])
            : Number(m[3])
          : a;
        const d = new Date(Date.UTC(aa, mese - 1, g));
        if (aa !== a) errore = "La data deve essere nel " + a;
        else if (
          d.getUTCFullYear() !== aa ||
          d.getUTCMonth() !== mese - 1 ||
          d.getUTCDate() !== g
        )
          errore = "Data inesistente";
        else
          return `${aa}-${String(mese).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
      }
      if (avvisa) GB.toast(errore, "err");
      return null;
    };
    // il calendario si limita ai giorni dell'anno scelto
    const limitiData = () => {
      const a = annoValido();
      cal.min = a ? a + "-01-01" : "";
      cal.max = a ? a + "-12-31" : "";
    };
    anno.addEventListener("input", () => {
      GB.clientiSelAnno = anno.value;
      GB.clientiSelAnnoManuale = true; // se l'hai scritto tu non lo cambio più da solo
      limitiData();
    });
    data.addEventListener("input", () => (GB.clientiSelData = data.value));
    cal.addEventListener("change", () => {
      if (!cal.value) return;
      const [, mm, gg] = cal.value.split("-");
      data.value = `${gg}/${mm}`;
      GB.clientiSelData = data.value;
    });
    limitiData();

    const bar = h(
      "div",
      { class: "sel-bar no-print", hidden: true },
      conteggio,
      h(
        "span",
        { class: "sel-field" },
        h("label", null, "Anno"),
        anno,
        h("label", null, "Data"),
        h("span", { class: "sel-data-wrap" }, data, pen, cal),
        h(
          "button",
          {
            class: "btn sm primary",
            title:
              "Crea l'esercizio di questo anno per tutti i selezionati (data vuota = 31/12)",
            onclick: () => {
              const iso = leggiData(true);
              if (iso === null) return;
              A.creaAnnoMultiplo([...ids], Number(anno.value), iso);
            },
          },
          "＋ Crea esercizio",
        ),
      ),
      h(
        "button",
        {
          class: "btn sm danger",
          onclick: () => A.eliminaMultiplo([...ids]),
        },
        h("span", { class: "btn-ico", "aria-hidden": "true" }, "🗑️"),
        "Elimina selezionati",
      ),
      h(
        "button",
        {
          class: "btn sm",
          onclick: () => {
            ids.clear();
            sel.ridisegna && sel.ridisegna();
          },
        },
        "Deseleziona tutto",
      ),
    );

    const sel = {
      ids,
      bar,
      chkAll: null, // la imposta la pagina quando crea la tabella
      ridisegna: null, // idem: ridisegna le righe
      /* Aggiorna barra e casella «seleziona tutti» in base alle righe visibili. */
      sincronizza(righeVisibili) {
        const n = ids.size;
        bar.hidden = n === 0;
        if (!GB.clientiSelAnnoManuale && n) {
          anno.value = GB.clientiSelAnno = prossimoAnno();
          limitiData();
        }
        conteggio.textContent = n + (n === 1 ? " selezionato" : " selezionati");
        const c = sel.chkAll;
        if (!c) return;
        const quanti = righeVisibili.filter((r) => ids.has(r.id)).length;
        c.checked = righeVisibili.length > 0 && quanti === righeVisibili.length;
        c.indeterminate = quanti > 0 && quanti < righeVisibili.length;
      },
    };
    return sel;
  };
})();
