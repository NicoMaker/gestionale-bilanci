/* Select con ricerca (digita per filtrare, frecce + Invio da tastiera). */
(function () {
  const GB = window.GB;
  const { h } = GB;

  /* ───────── select con ricerca ─────────
     searchSelect({ items:[{value,label,sub}], value, placeholder, emptyLabel, onChange(value) }) → elemento DOM.
     Si scrive nel campo per filtrare (anche senza accenti / maiuscole); ↑ ↓ Invio Esc da tastiera. */
  const plain = GB.plain;
  GB.searchSelect = function (opts) {
    const items = opts.items || [];
    let value = opts.value === undefined ? null : opts.value;
    let active = -1,
      shown = [];
    const input = h("input", {
      type: "text",
      class: "ss-input",
      placeholder: opts.placeholder || "Cerca…",
      autocomplete: "off",
      spellcheck: "false",
      role: "combobox",
      "aria-expanded": "false",
    });
    const list = h("ul", { class: "ss-list", role: "listbox" });
    const root = h(
      "div",
      { class: "ss" },
      input,
      h("span", { class: "ss-caret" }, "▾"),
      list,
    );
    const labelOf = (v) => {
      const it = items.find((i) => i.value === v);
      return it ? it.label : "";
    };
    const isOpen = () => root.classList.contains("open");

    function paint() {
      const rows = shown.map((it, i) =>
        h(
          "li",
          {
            class:
              "ss-item" +
              (i === active ? " active" : "") +
              (it.value === value ? " sel" : ""),
            role: "option",
            onmousedown: (e) => {
              e.preventDefault();
              choose(it.value);
            },
            onmousemove: () => {
              if (active !== i) {
                active = i;
                list
                  .querySelectorAll(".ss-item")
                  .forEach((x, k) => x.classList.toggle("active", k === i));
              }
            },
          },
          h("span", { class: "ss-l" }, it.label),
          it.sub ? h("span", { class: "sub" }, it.sub) : null,
        ),
      );
      list.replaceChildren(
        ...(rows.length
          ? rows
          : [h("li", { class: "ss-item none" }, "Nessun risultato")]),
      );
      const a = list.querySelector(".ss-item.active");
      if (a) a.scrollIntoView({ block: "nearest" });
    }
    function filter(q) {
      const toks = plain(q).split(/\s+/).filter(Boolean);
      const all = opts.emptyLabel
        ? [{ value: null, label: opts.emptyLabel }].concat(items)
        : items.slice();
      shown = toks.length
        ? items.filter((it) => {
            const t = plain(it.label + " " + (it.sub || ""));
            return toks.every((k) => t.includes(k));
          })
        : all;
      active = !shown.length
        ? -1
        : toks.length
          ? 0
          : Math.max(
              0,
              shown.findIndex((it) => it.value === value),
            );
      paint();
    }
    function open() {
      if (isOpen()) return;
      root.classList.add("open");
      input.setAttribute("aria-expanded", "true");
      input.select();
      filter("");
    }
    function close() {
      root.classList.remove("open");
      input.setAttribute("aria-expanded", "false");
      input.value = labelOf(value);
    }
    function choose(v) {
      const changed = v !== value;
      value = v;
      close();
      input.blur();
      if (changed && opts.onChange) opts.onChange(v);
    }

    input.value = labelOf(value);
    input.addEventListener("focus", open);
    input.addEventListener("click", open);
    input.addEventListener("blur", close);
    input.addEventListener("input", () => {
      if (!isOpen()) root.classList.add("open");
      filter(input.value);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen()) {
          open();
          return;
        }
        if (!shown.length) return;
        active =
          (active + (e.key === "ArrowDown" ? 1 : -1) + shown.length) %
          shown.length;
        paint();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (isOpen() && shown[active]) choose(shown[active].value);
      } else if (e.key === "Escape") {
        close();
        input.blur();
      }
    });
    return root;
  };
})();
