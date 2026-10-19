/* Matita ✏️ di modifica e finestra «Modifica riga»: la stessa esperienza dell'elenco clienti, per ogni tabella con dati modificabili.
   GB.penBtn({ title, onclick })               → pulsante matita da mettere nell'ultima cella della riga
   GB.editRow({ title, intro, fields })        → Promise<{ [key]: valore } | null>
     field: { key, label, type: "text" | "select" | "num", value, options: [{ v, label }], dec, placeholder, hint }
     i campi "num" (importi per anno, 12 mesi…) sono disposti a griglia; i valori numerici vuoti tornano come null. */
(function () {
  const GB = window.GB;
  const { h, parseNum } = GB;
  const { editText, paintInput, liveFormat } = GB.numFmt;

  GB.penBtn = ({ title = "Modifica riga", onclick }) =>
    h(
      "button",
      {
        type: "button",
        class: "edit-pen no-print",
        title,
        "aria-label": title,
        onclick,
      },
      "✏️",
    );

  GB.editRow = async function ({ title, intro, fields }) {
    const els = {};
    const box = (f) => {
      let el;
      if (f.type === "select") {
        el = h(
          "select",
          null,
          (f.options || []).map((o) =>
            h("option", { value: o.v, title: o.d || null }, o.label),
          ),
        );
        el.value = f.value ?? "";
      } else if (f.type === "num") {
        el = h("input", {
          type: "text",
          class: "num-edit",
          inputmode: "decimal",
          autocomplete: "off",
          spellcheck: "false",
          placeholder: f.placeholder || "",
          value: editText(f.value),
        });
        el.addEventListener("input", (e) => {
          liveFormat(el, e);
          paintInput(el);
        });
        paintInput(el);
      } else {
        el = h("input", {
          type: "text",
          autocomplete: "off",
          value: f.value ?? "",
          placeholder: f.placeholder || "",
        });
      }
      els[f.key] = el;
      return h(
        "div",
        { class: "field" },
        h("label", null, f.label),
        el,
        f.hint ? h("div", { class: "hint" }, f.hint) : null,
      );
    };
    const testo = fields.filter((f) => f.type !== "num").map(box);
    const numeri = fields.filter((f) => f.type === "num").map(box);
    const body = h(
      "div",
      null,
      intro ? h("p", { class: "edit-intro" }, intro) : null,
      testo,
      numeri.length ? h("div", { class: "edit-grid" }, numeri) : null,
    );
    // Invio nei campi di testo = Salva
    body.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.target.tagName !== "INPUT") return;
      e.preventDefault();
      const ok = body.closest(".overlay");
      if (ok) ok.querySelector(".btn.primary").click();
    });
    for (;;) {
      const r = await GB.modal({
        title,
        body,
        wide: numeri.length > 3,
        buttons: [
          { label: "Annulla", value: false },
          { label: "Salva", kind: "primary", value: true },
        ],
      });
      if (!r) return null;
      const out = {};
      let err = null;
      for (const f of fields) {
        const raw = els[f.key].value;
        if (f.type === "num") {
          const v = parseNum(raw);
          if (Number.isNaN(v)) {
            err = `Numero non valido in «${f.label}»`;
            break;
          }
          out[f.key] = v;
        } else out[f.key] = raw;
      }
      if (err) {
        GB.toast(err, "err");
        continue;
      }
      return out;
    }
  };

  // true se due valori (numero | null | undefined) sono diversi
  GB.changedVal = (a, b) => (a ?? null) !== (b ?? null);
})();
