/* Notifiche a comparsa (toast), con un'azione facoltativa (es. «Annulla»). */
(function () {
  const GB = window.GB;
  const { h } = GB;

  /* ───────── toast ───────── */
  // GB.toast(msg, "err"?, { sub?: testo secondario, action?: { label, fn } })
  GB.toast = function (msg, type, opts = {}) {
    let box = document.getElementById("toasts");
    if (!box) {
      box = h("div", { id: "toasts" });
      document.body.append(box);
    }
    const t = h(
      "div",
      { class: "toast" + (type === "err" ? " err" : "") },
      h(
        "div",
        { class: "toast-txt" },
        msg,
        opts.sub ? h("div", { class: "toast-sub" }, opts.sub) : null,
      ),
      opts.action
        ? h(
            "button",
            {
              type: "button",
              class: "toast-act",
              onclick: () => {
                t.remove();
                opts.action.fn();
              },
            },
            opts.action.label,
          )
        : null,
    );
    box.append(t);
    setTimeout(
      () => t.remove(),
      type === "err" ? 5000 : opts.action ? 9000 : 2200,
    );
  };
})();
