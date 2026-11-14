/* Form «Nuovo cliente» / «Modifica cliente»: ragione sociale, P.IVA (solo cifre, 11), anno impostato, note. Restituisce i dati o null.
   In modifica l'anno base si sceglie tra gli esercizi già creati del cliente. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti = { azioni: {} };

  GB.parts.clienti.form = async function (c) {
    const nuovo = !c;
    // in modifica: solo gli esercizi già creati (l'anno base attuale c'è sempre, anche se per qualche motivo non fosse nell'elenco)
    const anniCreati = nuovo
      ? []
      : [...new Set([...(c.anni || []), c.anno_base])].sort((a, b) => b - a);
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
      anno: nuovo
        ? h("input", {
            type: "number",
            value: new Date().getFullYear() - 1,
            min: 1990,
            max: 2100,
          })
        : h(
            "select",
            { "aria-label": "Anno base del cliente" },
            anniCreati.map((a) =>
              h(
                "option",
                { value: a, selected: a === c.anno_base || null },
                String(a),
              ),
            ),
          ),
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
          h(
            "label",
            null,
            nuovo
              ? "Anno impostato (ultimo esercizio chiuso)"
              : "Anno base (tra gli esercizi creati)",
          ),
          f.anno,
          h(
            "div",
            { class: "hint" },
            nuovo
              ? "Gli esercizi vengono creati in automatico dall'anno impostato fino all'ultimo anno chiuso e si aggiornano da soli ogni anno. Il budget è quello dell'anno successivo."
              : "Puoi scegliere solo uno degli esercizi già creati per questo cliente. Per averne altri usa «＋» (anche più anni insieme) nella barra in alto.",
          ),
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
      payload.anno_base = anno; // in modifica è uno degli esercizi creati (controllato anche dal server)
      return payload;
    }
  };
})();
