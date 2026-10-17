/* UI helpers: formattazione, DOM builder, modali, toast, input numerici in stile "foglio di calcolo" */
(function () {
  const GB = (window.GB = window.GB || { pages: {} });

  /* ───────── formattazione (it-IT) ───────── */
  const nf = {};
  function nfmt(dec) {
    return (
      nf[dec] ||
      (nf[dec] = new Intl.NumberFormat("it-IT", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      }))
    );
  }
  const fmt = {
    // importo con decimali; null/undefined → ""
    num(x, dec = 2) {
      return x === null || x === undefined || !isFinite(x)
        ? ""
        : nfmt(dec).format(Math.abs(x) < 0.5 * Math.pow(10, -dec) ? 0 : x);
    },
    int(x) {
      return fmt.num(x, 0);
    },
    eur(x, dec = 0) {
      return x === null || x === undefined || !isFinite(x)
        ? "–"
        : nfmt(dec).format(x) + " €";
    },
    // frazione → percentuale (0.123 → 12,30 %)
    pct(x, dec = 2) {
      return x === null || x === undefined || !isFinite(x)
        ? ""
        : nfmt(dec).format(x * 100) + " %";
    },
    // valore già espresso in punti percentuali (12.3 → 12,30)
    pt(x, dec = 2) {
      return x === null || x === undefined || !isFinite(x)
        ? ""
        : nfmt(dec).format(x);
    },
    short(x) {
      if (x === null || x === undefined || !isFinite(x)) return "";
      const a = Math.abs(x);
      if (a >= 1e6)
        return (x / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(".", ",") + " M";
      if (a >= 1e3) return (x / 1e3).toFixed(0) + " k";
      return String(Math.round(x));
    },
    data(d) {
      return new Date(d.replace(" ", "T") + "Z").toLocaleDateString("it-IT");
    },
  };
  GB.fmt = fmt;

  // "1.234,56" | "1234,56" | "1234.56" | "-1.234" | "(500)" → numero ; vuoto → null ; non valido → NaN
  function parseNum(str) {
    let s = String(str ?? "")
      .trim()
      .replace(/\s|€|%/g, "");
    if (s === "") return null;
    let neg = false;
    if (/^\(.*\)$/.test(s)) {
      neg = true;
      s = s.slice(1, -1);
    }
    if (s.startsWith("-")) {
      neg = !neg;
      s = s.slice(1);
    } else if (s.startsWith("+")) s = s.slice(1);
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    if (!/^\d*\.?\d+$|^\d+\.$/.test(s)) return NaN;
    const v = parseFloat(s);
    return neg ? -v : v;
  }
  GB.parseNum = parseNum;

  /* ───────── DOM builder ───────── */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") el.className = v;
        else if (k === "style" && typeof v === "object")
          Object.assign(el.style, v);
        else if (k === "html") el.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function")
          el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === "dataset") Object.assign(el.dataset, v);
        else if (v === true) el.setAttribute(k, "");
        else el.setAttribute(k, v);
      }
    }
    for (const c of children.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  GB.h = h;
  GB.esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  /* ───────── toast ───────── */
  GB.toast = function (msg, type) {
    let box = document.getElementById("toasts");
    if (!box) {
      box = h("div", { id: "toasts" });
      document.body.append(box);
    }
    const t = h(
      "div",
      { class: "toast" + (type === "err" ? " err" : "") },
      msg,
    );
    box.append(t);
    setTimeout(() => t.remove(), type === "err" ? 5000 : 2200);
  };

  /* ───────── modale ───────── */
  // modal({title, body:Node, buttons:[{label, kind, value}]}) → Promise<value|null>
  GB.modal = function ({ title, body, buttons }) {
    return new Promise((resolve) => {
      const close = (v) => {
        overlay.remove();
        document.removeEventListener("keydown", onKey);
        resolve(v);
      };
      const onKey = (e) => {
        if (e.key === "Escape") close(null);
      };
      const btns = (
        buttons || [{ label: "OK", kind: "primary", value: true }]
      ).map((b) =>
        h(
          "button",
          { class: "btn " + (b.kind || ""), onclick: () => close(b.value) },
          b.label,
        ),
      );
      const overlay = h(
        "div",
        {
          class: "overlay",
          onmousedown: (e) => {
            if (e.target === overlay) close(null);
          },
        },
        h(
          "div",
          { class: "modal", role: "dialog" },
          h("div", { class: "modal-h" }, title),
          h("div", { class: "modal-b" }, body),
          h("div", { class: "modal-f" }, btns),
        ),
      );
      document.body.append(overlay);
      document.addEventListener("keydown", onKey);
      const first = overlay.querySelector("input,select,textarea");
      if (first) first.focus();
      overlay._close = close;
    });
  };
  // Tabellina "cosa si perde": d = {anni:[{anno,valori,vendite,cashflow,budget_var,parametri,totale}]} oppure un singolo anno
  GB.riepilogoDati = function (d) {
    const anni = d.anni || [d];
    const th = (t) =>
      h(
        "th",
        { style: { textAlign: "right", padding: "4px 8px", fontSize: "11px" } },
        t,
      );
    return h(
      "div",
      {
        class: "tbl-wrap free",
        style: { margin: "10px 0", maxHeight: "220px" },
      },
      h(
        "table",
        { class: "fin" },
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h("th", { class: "l" }, "Anno"),
            th("Bilancio"),
            th("Vendite"),
            th("Cash flow"),
            th("Var. budget"),
            th("Parametri"),
          ),
        ),
        h(
          "tbody",
          null,
          anni
            .filter((a) => a.totale)
            .map((a) =>
              h(
                "tr",
                { class: "line" },
                h("td", { class: "l" }, String(a.anno)),
                [
                  a.valori,
                  a.vendite,
                  a.cashflow,
                  a.budget_var,
                  a.parametri,
                ].map((x) => h("td", { class: "n" }, x ? String(x) : "–")),
              ),
            ),
        ),
      ),
    );
  };
  GB.confirm = (message, okLabel = "Elimina") =>
    GB.modal({
      title: "Conferma",
      body: h("p", null, message),
      buttons: [
        { label: "Annulla", value: false },
        { label: okLabel, kind: "danger", value: true },
      ],
    });

  /* ───────── select con ricerca ─────────
     searchSelect({ items:[{value,label,sub}], value, placeholder, emptyLabel, onChange(value) }) → elemento DOM.
     Si scrive nel campo per filtrare (anche senza accenti / maiuscole); ↑ ↓ Invio Esc da tastiera. */
  const plain = (s) =>
    String(s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
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

  /* ───────── input numerico a cella ───────── */
  // numInput(valore, {onCommit(v|null), dec, readonly, cls})
  GB.numInput = function (value, opts = {}) {
    const dec = opts.dec ?? 2;
    const el = h("input", {
      type: "text",
      class: "ci num " + (opts.cls || ""),
      inputmode: "decimal",
      autocomplete: "off",
      spellcheck: "false",
    });
    let current = value === undefined ? null : value;
    const show = () => {
      el.value =
        current === null || (current === 0 && opts.hideZero)
          ? ""
          : fmt.num(current, dec);
      el.classList.toggle("neg", current !== null && current < 0);
    };
    show();
    if (opts.readonly) {
      el.readOnly = true;
      return el;
    }
    el.addEventListener("focus", () => {
      el.value = current === null ? "" : String(current).replace(".", ",");
      el.select();
    });
    const commit = () => {
      const v = parseNum(el.value);
      if (Number.isNaN(v)) {
        GB.toast("Numero non valido", "err");
        show();
        return;
      }
      if (v !== current) {
        current = v;
        opts.onCommit && opts.onCommit(v);
      }
      show();
    };
    el.addEventListener("blur", commit);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        show();
        el.blur();
      }
    });
    return el;
  };

  // Navigazione tipo Excel: Invio / ↓ → riga sotto, ↑ → riga sopra (stessa colonna `data-col`)
  GB.gridNav = function (root) {
    root.addEventListener("keydown", (e) => {
      const t = e.target;
      if (!t.classList || !t.classList.contains("ci")) return;
      if (!["Enter", "ArrowDown", "ArrowUp"].includes(e.key)) return;
      if (t.tagName === "SELECT" && e.key !== "Enter") return;
      const col = t.dataset.col;
      if (!col) return;
      const all = [
        ...root.querySelectorAll(
          `.ci[data-col="${col}"]:not([readonly]):not([disabled])`,
        ),
      ];
      const i = all.indexOf(t);
      const next = all[e.key === "ArrowUp" ? i - 1 : i + 1];
      e.preventDefault();
      if (next) next.focus();
    });
  };

  /* ───────── celle "live" (ricalcolate quando cambiano i dati) ───────── */
  GB.live = function () {
    const items = [];
    return {
      add(el, fn) {
        items.push([el, fn]);
        try {
          fn(el);
        } catch (e) {
          console.error(e);
        }
        return el;
      },
      update() {
        for (const [el, fn] of items) {
          try {
            fn(el);
          } catch (e) {
            console.error(e);
          }
        }
      },
    };
  };
  // helper: imposta testo + classe neg
  GB.setNum = (el, v, dec = 2) => {
    el.textContent = fmt.num(v, dec);
    el.classList.toggle("neg", v !== null && v < 0);
  };
})();
