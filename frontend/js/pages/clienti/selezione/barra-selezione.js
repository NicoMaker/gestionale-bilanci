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
    const conteggio = h("span", { class: "sel-count" });
    const anno = h("input", {
      type: "number",
      min: 1990,
      max: 2100,
      value: GB.clientiSelAnno || new Date().getFullYear(),
      class: "sel-anno",
      "aria-label": "Anno dell'esercizio da creare",
      title: "Anno dell'esercizio da creare per i clienti selezionati",
    });
    // data di chiusura dell'esercizio: se resta vuota viene usato il 31/12 dell'anno
    const data = h("input", {
      type: "date",
      value: GB.clientiSelData || "",
      class: "sel-anno sel-data",
      "aria-label": "Data di chiusura dell'esercizio (vuota = 31/12)",
      title: "Data di chiusura dell'esercizio. Se la lasci vuota viene usato il 31/12 dell'anno",
    });
    // la data resta nell'anno scelto (se l'anno cambia e la data no, si riporta al 31/12 solo se serve)
    const limitiData = () => {
      const a = Number(anno.value);
      if (Number.isInteger(a) && a >= 1990 && a <= 2100) {
        data.min = a + "-01-01";
        data.max = a + "-12-31";
        if (data.value && data.value.slice(0, 4) !== String(a)) {
          data.value = "";
          GB.clientiSelData = "";
        }
      } else {
        data.min = data.max = "";
      }
    };
    anno.addEventListener("input", () => {
      GB.clientiSelAnno = anno.value;
      limitiData();
    });
    data.addEventListener("input", () => (GB.clientiSelData = data.value));
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
        data,
        h(
          "button",
          {
            class: "btn sm primary",
            title:
              "Crea l'esercizio di questo anno per tutti i selezionati (data vuota = 31/12)",
            onclick: () =>
              A.creaAnnoMultiplo([...ids], Number(anno.value), data.value),
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
