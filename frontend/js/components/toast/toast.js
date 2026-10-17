/* Notifiche a comparsa (toast). */
(function () {
  const GB = window.GB;
  const { h } = GB;

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
})();
