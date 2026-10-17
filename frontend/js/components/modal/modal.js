/* Finestra modale e conferma. */
(function () {
  const GB = window.GB;
  const { h } = GB;

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
  GB.confirm = (message, okLabel = "Elimina") =>
    GB.modal({
      title: "Conferma",
      body: h("p", null, message),
      buttons: [
        { label: "Annulla", value: false },
        { label: okLabel, kind: "danger", value: true },
      ],
    });
})();
