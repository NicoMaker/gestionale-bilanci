/* Righe strutturali della tabella: titolo, spaziatore, intestazione di sezione e «+ aggiungi riga». */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.finRows = GB.finRows || {};

  GB.finRows.titolo = function (x, item) {
    const { span, tb } = x;
    tb.append(
      h(
        "tr",
        { class: "title" },
        h(
          "td",
          { colspan: span },
          h("span", { class: "stk-label" }, item.label),
        ),
      ),
    );
  };

  GB.finRows.spazio = function (x) {
    const { span, tb } = x;
    tb.append(h("tr", { class: "spacer" }, h("td", { colspan: span })));
  };

  GB.finRows.intestazioneSez = function (x, item) {
    const { span, tb } = x;
    tb.append(
      h(
        "tr",
        { class: "sec" },
        h(
          "td",
          { colspan: span },
          h("span", { class: "stk-label" }, item.label),
        ),
      ),
    );
  };

  GB.finRows.aggiungi = function (x, item) {
    const { cfg, span, tb, S } = x;
    tb.append(
      h(
        "tr",
        { class: "add no-ro" },
        h(
          "td",
          { colspan: span },
          h(
            "span",
            { class: "stk-label" },
            h(
              "button",
              {
                class: "addbtn",
                onclick: () => S.addVoce(cfg.ambito, item.id),
              },
              "+ aggiungi riga",
            ),
          ),
        ),
      ),
    );
  };
})();
