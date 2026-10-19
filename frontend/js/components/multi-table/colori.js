/* Un colore per ogni esercizio (si ripetono dopo 7). */
(function () {
  const GB = window.GB;

  const COLORS = [
    "var(--accent)",
    "var(--green)",
    "var(--red)",
    "var(--yellow)",
    "var(--purple)",
    "var(--cyan)",
    "var(--orange)",
  ];
  GB.yearColor = (i) => COLORS[i % COLORS.length];
})();
