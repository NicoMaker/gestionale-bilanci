/* Tooltip del grafico: compare solo sull'elemento toccato (barra, punto o linea). Mouse: passaggio + clic per fissarlo; touch: tocco. */
(function () {
  const GB = window.GB;

  GB.chartTooltip = function ({ svg, fmt2, tipFmt }) {
    const tip = GB.h("div", { class: "chart-tip", role: "status" });
    const box = GB.h("div", { class: "chart-box" });
    let pinned = null; // elemento fissato con il clic
    let marked = null; // elemento evidenziato
    const valueText = (v, isY2) =>
      tipFmt
        ? tipFmt(v)
        : isY2
          ? fmt2(Math.round(v * 100) / 100)
          : GB.fmt.num(v, Math.abs(v) >= 1000 ? 0 : 2);
    const setMark = (el, on) => {
      el.classList.toggle("sel", on);
      if (el.classList.contains("mark")) el.style.display = on ? "" : "none";
    };
    const unmark = () => {
      if (marked) setMark(marked, false);
      marked = null;
    };
    const hideTip = () => {
      tip.classList.remove("on");
      unmark();
    };
    const place = (ev) => {
      const b = box.getBoundingClientRect();
      let x = ev.clientX - b.left + 14,
        y = ev.clientY - b.top - 14 - tip.offsetHeight;
      if (x + tip.offsetWidth > b.width)
        x = ev.clientX - b.left - tip.offsetWidth - 14;
      if (x < 0) x = 4;
      if (y < 0) y = ev.clientY - b.top + 16;
      tip.style.left = x + "px";
      tip.style.top = y + "px";
    };
    const showTip = (info, ev, markEl) => {
      const cls = info.v > 0 ? " pos" : info.v < 0 ? " neg" : "";
      tip.replaceChildren(
        GB.h("div", { class: "t" }, String(info.label)),
        GB.h(
          "div",
          { class: "r" },
          GB.h("i", { style: { background: info.color || "var(--accent)" } }),
          GB.h("span", null, info.name),
          GB.h("b", { class: "v" + cls }, valueText(info.v, info.y2)),
        ),
      );
      tip.classList.add("on");
      unmark();
      if (markEl) {
        setMark(markEl, true);
        marked = markEl;
      }
      place(ev);
    };
    // collega un elemento del grafico: info(ev) → { name, label, v, color, y2, mark? }
    const attach = (el, info) => {
      el.classList.add("hit");
      el.addEventListener("pointerenter", (ev) => {
        if (ev.pointerType === "mouse" && !pinned) {
          const i = info(ev);
          showTip(i, ev, i.mark || el);
        }
      });
      el.addEventListener("pointermove", (ev) => {
        if (ev.pointerType !== "mouse" || pinned) return;
        const i = info(ev);
        showTip(i, ev, i.mark || el);
      });
      el.addEventListener("pointerleave", (ev) => {
        if (ev.pointerType === "mouse" && !pinned) hideTip();
      });
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const i = info(ev);
        pinned = true;
        showTip(i, ev, i.mark || el);
      });
    };
    // clic sullo sfondo: il tooltip sparisce
    svg.addEventListener("click", () => {
      pinned = null;
      hideTip();
    });
    document.addEventListener("keydown", function esc(e) {
      if (!box.isConnected) return document.removeEventListener("keydown", esc);
      if (e.key === "Escape") {
        pinned = null;
        hideTip();
      }
    });
    return { tip, box, attach };
  };
})();
