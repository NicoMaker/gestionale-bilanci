/* Form «Nuovo cliente» / «Modifica cliente»: ragione sociale, P.IVA (solo cifre, 11), anno impostato, note. Restituisce i dati o null. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti = { azioni: {} };

  GB.parts.clienti.form = async function (c) {
    const nuovo = !c;
    const f = {
      rs: h("input", {
        value: c ? c.ragione_sociale : "",
        placeholder: "Es. Rossi S.r.l.",
      }),
      piva: h("input", {
        value: c ? c.partita_iva || "" : "",
        placeholder: "01234567890",
        inputmode: "numeric",
        pattern: "[0-9]*",
        maxlength: 11,
        autocomplete: "off",
      }),
      anno: h("input", {
        type: "number",
        value: c ? c.anno_base : new Date().getFullYear() - 1,
        min: 1990,
        max: 2100,
        disabled: !nuovo || null,
      }),
      note: h(
        "textarea",
        { rows: 3, placeholder: "Note interne…" },
        c ? c.note || "" : "",
      ),
    };
    // Partita IVA: solo cifre (vale anche per incolla e trascinamento), massimo 11
    f.piva.addEventListener("input", () => {
      const pulito = f.piva.value.replace(/\D/g, "").slice(0, 11);
      if (pulito !== f.piva.value) f.piva.value = pulito;
    });
    f.piva.addEventListener("keydown", (e) => {
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !/\d/.test(e.key)
      )
        e.preventDefault();
    });
    const body = h(
      "div",
      null,
      h("div", { class: "field" }, h("label", null, "Ragione sociale *"), f.rs),
      h(
        "div",
        { class: "row2" },
        h("div", { class: "field" }, h("label", null, "Partita IVA"), f.piva),
        h(
          "div",
          { class: "field" },
          h("label", null, "Anno impostato (ultimo esercizio chiuso)"),
          f.anno,
          nuovo
            ? h(
                "div",
                { class: "hint" },
                "Il bilancio mostra tutti gli esercizi (almeno anno−2 … anno) e il budget dell'anno successivo.",
              )
            : null,
        ),
      ),
      h("div", { class: "field" }, h("label", null, "Note"), f.note),
    );
    for (;;) {
      const r = await GB.modal({
        title: nuovo ? "Nuovo cliente" : "Modifica cliente",
        body,
        buttons: [
          { label: "Annulla", value: false },
          {
            label: nuovo ? "Crea cliente" : "Salva",
            kind: "primary",
            value: true,
          },
        ],
      });
      if (!r) return null;
      const piva = f.piva.value.replace(/\s/g, "");
      const anno = Number(f.anno.value);
      let err = null;
      if (!f.rs.value.trim()) err = "La ragione sociale è obbligatoria";
      else if (piva && !/^\d{11}$/.test(piva))
        err = "Partita IVA non valida: servono 11 cifre";
      else if (nuovo && (!Number.isInteger(anno) || anno < 1990 || anno > 2100))
        err = "Anno impostato non valido (1990–2100)";
      if (err) {
        GB.toast(err, "err");
        continue;
      }
      const payload = {
        ragione_sociale: f.rs.value,
        partita_iva: piva,
        note: f.note.value,
      };
      if (nuovo) payload.anno_base = anno;
      return payload;
    }
  };
})();
