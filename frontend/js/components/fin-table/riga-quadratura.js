/* Riga di controllo (Check S.P. = 0) con evidenziazione verde/rossa. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.finRows = GB.finRows || {};

  GB.finRows.check = function (x, item) {
    const { cfg, ro, ce, years, live, S, span, tb } = x;
    const calcOf = (a) => cfg.getY(a);
    const tr = h(
      "tr",
      { class: "chk" },
      h("td", { class: "stk1" }),
      h("td", { class: "l stk2" }, item.label),
    );
    if (ce) tr.append(h("td"));
    years.forEach((a) => {
      const c = h("td", { class: "n" });
      tr.append(h("td", { class: "gap" }), c, h("td", { class: "pc" }));
      live.add(c, (e) => {
        const v = calcOf(a)[item.key];
        e.textContent = fmt.num(v);
      });
    });
    tr.append(h("td", { class: "no-ro" }));
    live.add(tr, (e) => {
      const ok = years.every((a) => Math.abs(calcOf(a)[item.key]) < 0.005);
      e.classList.toggle("ok", ok);
      e.classList.toggle("ko", !ok);
    });
    tb.append(tr);
  };
})();
