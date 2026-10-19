/* Stato «Nessun cliente»: invito a creare il primo cliente o caricare il demo. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.vuoto = function () {
    return h(
      "div",
      { class: "empty" },
      h("div", { class: "big" }, "👥"),
      h("h2", null, "Nessun cliente"),
      h(
        "p",
        null,
        "Crea il primo cliente indicando l'anno impostato, oppure carica i clienti demo (20 aziende di esempio) per vedere l'app all'opera.",
      ),
    );
  };
})();
