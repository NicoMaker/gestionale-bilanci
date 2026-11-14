/* Barra in alto: «＋ Nuovo cliente» e «📦 Carica clienti demo» (20 aziende). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.barra = function ({ nuovo, demoClienti, creaAnni }) {
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
      creaAnni
        ? h(
            "button",
            {
              class: "btn",
              onclick: creaAnni,
              title:
                "Crea gli esercizi di uno o più anni per tutti i clienti (data comune o date diverse; chi ha già un anno lo tiene com'è)",
            },
            "📅 Crea anni per tutti",
          )
        : null,
      h(
        "button",
        {
          class: "btn",
          onclick: demoClienti,
          title:
            "Aggiunge 20 clienti di esempio con bilanci, vendite, budget e cash flow",
        },
        "📦 Carica clienti demo",
      ),
    );
  };
})();
