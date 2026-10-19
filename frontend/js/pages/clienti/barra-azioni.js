/* Barra in alto: «＋ Nuovo cliente» e «✨ Carica cliente demo». */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.barra = function ({ nuovo, demo, aggiungiAnno }) {
    return h(
      "div",
      {
        class: "no-print",
        style: {
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
        },
      },
      h("button", { class: "btn primary", onclick: nuovo }, "＋ Nuovo cliente"),
      h(
        "button",
        {
          class: "btn",
          onclick: demo,
          title: "Crea un cliente di esempio con dati fittizi",
        },
        "✨ Carica cliente demo",
      ),
      aggiungiAnno
        ? h(
            "button",
            {
              class: "btn",
              onclick: aggiungiAnno,
              title: "Aggiungi l'anno successivo a tutti i clienti",
            },
            "＋ Aggiungi anno a tutti",
          )
        : null,
    );
  };
})();
