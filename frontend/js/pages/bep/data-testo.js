/* Testo della data di pareggio («12 marzo», «oltre il 31 dicembre», «n.d.»). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.bep = {};

  GB.parts.bep.dataTxt = (giorno) => {
    const d = window.Calc.dayLabel(giorno);
    return d
      ? d.oltre
        ? "oltre il 31 dicembre"
        : d.giornoMese + " " + T.MESI[d.mese].toLowerCase()
      : "n.d.";
  };
})();
