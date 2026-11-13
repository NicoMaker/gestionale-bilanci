/* Intestazione della tabella: Cod. e Descrizione fissi a sinistra, un blocco (anno, %) per ogni esercizio. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.finHeader = function (cfg, ro) {
    const S = GB.store;
    const years = cfg.years;
    const ce = cfg.ambito === "CE";
    // intestazione: Cod. e Descrizione restano fissi a sinistra mentre si scorrono gli anni
    const hr = h(
      "tr",
      null,
      h("th", { class: "l stk1" }, "Cod."),
      h("th", { class: "l stk2" }, cfg.titleCol || "Descrizione"),
    );
    if (ce) hr.append(h("th", null, "Tipo"));
    const selAnni = GB.sel.anni(); // selezione di più anni per eliminarli insieme
    years.forEach((a) => {
      const canDel = !ro && S.anni.length > 1 && S.anni.includes(a);
      hr.append(
        h("th", { class: "gap" }),
        h(
          "th",
          { class: "yr" },
          canDel
            ? h(
                "span",
                { class: "yr-sel" },
                (() => {
                  const b = GB.sel.box(selAnni, a);
                  b.title = `Seleziona l'anno ${a} (per eliminare più anni insieme)`;
                  b.setAttribute("aria-label", b.title);
                  return b;
                })(),
              )
            : null,
          h("span", { class: "yr-n" }, String(a)),
          GB.dataTag(a, !ro && S.anni.includes(a)),
          canDel
            ? h(
                "button",
                {
                  class: "xbtn no-ro",
                  title: `Elimina l'anno ${a}`,
                  onclick: () => GB.eliminaAnno(a),
                },
                "✕",
              )
            : null,
        ),
        h("th", null, "%"),
      );
    });
    hr.append(
      h(
        "th",
        { class: "no-ro pen-cell" },
        ro ? null : GB.penDateChiusura(years),
      ),
    );
    return hr;
  };
})();
