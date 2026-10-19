/* Azione «Carica cliente demo»: crea il cliente di esempio e lo seleziona. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const S = GB.store;

  GB.parts.clienti.azioni.demo = async () => {
    try {
      const c = await GB.api.post("/demo");
      await S.loadClienti();
      await S.select(c.id, c.anno_base);
      GB.toast("Cliente demo creato");
      location.hash = "#/dashboard";
    } catch (e) {
      GB.toast(e.message, "err");
    }
  };
})();
