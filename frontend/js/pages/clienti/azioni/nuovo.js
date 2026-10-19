/* Azione «Nuovo cliente»: apre il form, crea il cliente e lo seleziona. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const S = GB.store;

  const formCliente = (c) => GB.parts.clienti.form(c);
  GB.parts.clienti.azioni.nuovo = async () => {
    const p = await formCliente(null);
    if (!p) return;
    try {
      const c = await GB.api.post("/clienti", p);
      await S.loadClienti();
      await S.select(c.id, c.anno_base);
      GB.toast("Cliente creato");
      location.hash = "#/dashboard";
    } catch (e) {
      GB.toast(e.message, "err");
    }
  };
})();
