/* Input numerico a cella, stile foglio di calcolo. */
(function () {
  const GB = window.GB;
  const { h, fmt, parseNum } = GB;
  const { editText, paintInput, liveFormat } = GB.numFmt;

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
      paintInput(el);
    };
    show();
    if (opts.readonly) {
      el.readOnly = true;
      return el;
    }
    el.addEventListener("focus", () => {
      el.value = editText(current);
      el.select();
    });
    el.addEventListener("input", (e) => {
      liveFormat(el, e);
      paintInput(el);
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
})();
