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
    years.forEach((a) => {
      const canDel = !ro && S.anni.length > 1 && S.anni.includes(a);
      hr.append(
        h("th", { class: "gap" }),
        h(
          "th",
          { class: "yr" },
          String(a),
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
    hr.append(h("th", { class: "no-ro" }, ""));
    return hr;
  };
})();
