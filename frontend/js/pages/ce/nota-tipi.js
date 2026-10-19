/* Legenda dei tipi riga mostrata sopra la tabella. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.ce.notaTipi = function () {
    return h(
      "div",
      { class: "note no-print" },
      h("b", null, "Tipo riga: "),
      "IP inflazione + produttività · I inflazione · P produttività · O come anno precedente · Z azzerato · V spesa variabile · F spesa fissa. ",
      "Il tipo guida il Budget e il calcolo del punto di pareggio (spese fisse = tipo F, spese variabili = tipo V). Scorri a destra per vedere tutti gli anni: codice e descrizione restano fissi.",
    );
  };
})();
