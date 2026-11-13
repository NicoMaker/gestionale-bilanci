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
    const annoValido = () => {
      const a = Number(anno.value);
      return Number.isInteger(a) && a >= 1990 && a <= 2100 ? a : null;
    };
    // data di chiusura dell'esercizio: si scrive solo giorno e mese, l'anno è quello del campo «Anno» e compare scritto da solo
    // accanto (si aggiorna se cambi l'anno); calendario a destra; «↺ 31/12» svuota il campo; vuota = 31/12 dell'anno
    const campo = GB.campoData({
      anno: annoValido(),
      testo: GB.clientiSelData || "",
      compatto: true,
      etichetta: "Data di chiusura dell'esercizio (gg/mm, vuota = 31/12)",
      onChange: () => {
        GB.clientiSelData = campo.testo();
        reset.disabled = campo.vuoto();
      },
    });
    const reset = GB.resetDataBtn({
      label: "",
      title: "Data di chiusura automatica: 31/12 dell'anno",
      onclick: () => campo.reset(),
    });
    reset.classList.add("compatto");
    reset.append(" 31/12");
    reset.disabled = campo.vuoto();
    anno.addEventListener("input", () => {
      GB.clientiSelAnno = anno.value;
      GB.clientiSelAnnoManuale = true; // se l'hai scritto tu non lo cambio più da solo
      campo.setAnno(annoValido());
    });

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
        h("span", { class: "dcamp-riga" }, campo.el, reset),
        h(
          "button",
          {
            class: "btn sm primary",
            title:
              "Crea l'esercizio di questo anno per tutti i selezionati (data vuota = 31/12)",
            onclick: () => {
              const iso = campo.get(true);
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
          campo.setAnno(annoValido());
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
