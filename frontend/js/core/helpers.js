/* Piccoli helper condivisi dalle pagine. */
(function () {
  const GB = window.GB;

  /* Piccoli helper condivisi dalle pagine */
  GB.ctx = () => GB.store;
  GB.yearHeads = (years) => years.map((a) => String(a));
})();
