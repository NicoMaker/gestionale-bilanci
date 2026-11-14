/* Pulsante «Aggiungi anno» per le pagine con tutti gli esercizi in colonna. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  // pulsante "aggiungi anno" dentro le pagine con tutti gli esercizi in colonna
  GB.addAnnoBtn = () =>
    h(
      "button",
      {
        class: "btn sm",
        title:
          "Aggiunge l'anno successivo all'ultimo esercizio (data di chiusura a scelta, altrimenti 31/12)",
        onclick: () => GB.aggiungiAnno(),
      },
      "＋ Aggiungi anno",
    );

  // pulsante "più anni": crea in un colpo gli esercizi da un anno a un altro
  GB.addAnniBtn = () =>
    h(
      "button",
      {
        class: "btn sm",
        title: "Aggiunge più esercizi in un colpo (da un anno a un altro)",
        onclick: () => GB.aggiungiAnniMultipli(),
      },
      "＋ Più anni",
    );
})();
