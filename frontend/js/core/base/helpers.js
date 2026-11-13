/* Piccoli helper condivisi dalle pagine. */
(function () {
  const GB = window.GB;

  /* Piccoli helper condivisi dalle pagine */
  GB.ctx = () => GB.store;
  GB.yearHeads = (years) => years.map((a) => String(a));
  // intestazione di colonna: anno + data di chiusura sotto
  GB.yearHead = (a, editable) => [String(a), GB.dataTag(a, editable)];
})();
