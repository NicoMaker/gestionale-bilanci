/* Azione «Modifica»: apre il form con i dati del cliente e salva. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const S = GB.store;

  const formCliente = (c) => GB.parts.clienti.form(c);
  GB.parts.clienti.azioni.modifica = async (c) => {
    const p = await formCliente(c);
    if (!p) return;
    try {
      await GB.api.put("/clienti/" + c.id, p);
      await S.loadClienti();
      if (S.clienteId === c.id) await S.reload();
      GB.toast("Salvato");
    } catch (e) {
      GB.toast(e.message, "err");
    }
  };
})();
