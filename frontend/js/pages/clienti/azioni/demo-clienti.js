/* Azione «Carica clienti demo»: aggiunge i 20 clienti di esempio (settori diversi, bilanci completi) e aggiorna l'elenco. */
(function () {
  const GB = window.GB;
  const S = GB.store;

  GB.parts.clienti.azioni.demoClienti = async () => {
    try {
      const r = await GB.api.post("/demo/clienti");
      await S.loadClienti();
      GB.toast(
        r.creati
          ? `${r.creati} clienti demo caricati`
          : "I clienti demo sono già presenti",
      );
      S.emit("structure");
    } catch (e) {
      GB.toast(e.message, "err");
    }
  };
})();
