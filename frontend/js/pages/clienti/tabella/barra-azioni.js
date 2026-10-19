/* Barra in alto: «＋ Nuovo cliente» e «📦 Carica clienti demo» (20 aziende). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.barra = function ({ nuovo, demoClienti }) {
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
          onclick: demoClienti,
          title: "Aggiunge 20 clienti di esempio con bilanci, vendite, budget e cash flow",
        },
        "📦 Carica clienti demo",
      ),
    );
  };
})();
