/* Azione «Apri»: seleziona il cliente e va al riepilogo. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const S = GB.store;

  GB.parts.clienti.azioni.apri = async (c) => {
    await S.select(c.id);
    location.hash = "#/dashboard";
  };
})();
