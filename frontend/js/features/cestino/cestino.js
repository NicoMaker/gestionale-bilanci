/* Cestino: contatore nel menu, notifica «Annulla» dopo ogni eliminazione e ripristino rapido dell'ultimo elemento. */
(function () {
  const GB = window.GB;
  const S = GB.store;
  let timer = null;

  GB.cestino = {
    n: 0,
    giorni: 15,

    // rilegge quanti elementi ci sono nel cestino e aggiorna il menu (con un breve ritardo per raggruppare le chiamate)
    refresh() {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const r = await GB.api.get("/cestino/conteggio");
          if (r.n !== GB.cestino.n) {
            GB.cestino.n = r.n;
            if (GB.app && GB.app.buildNav) GB.app.buildNav();
          }
        } catch (e) {
          /* ignore */
        }
      }, 120);
    },

    // dopo un ripristino: ricarica elenco clienti e dati del cliente aperto
    async dopoRipristino() {
      await S.loadClienti();
      if (S.clienteId && S.clienti.some((c) => c.id === S.clienteId))
        await S.reload();
      else GB.app.render();
      GB.cestino.refresh();
    },

    // ripristina l'ultimo elemento spostato nel cestino
    async annulla() {
      try {
        const l = await GB.api.get("/cestino");
        const it = l.elementi[0];
        if (!it) return;
        await GB.api.post("/cestino/ripristina", { ids: [it.id] });
        GB.toast("Ripristinato: " + it.etichetta);
        await GB.cestino.dopoRipristino();
      } catch (e) {
        GB.toast(e.message, "err");
      }
    },
  };

  GB.cestino.refresh(); // contatore iniziale nel menu

  // «eliminato»: notifica con Annulla e promemoria dei 15 giorni
  GB.deleted = (msg) =>
    GB.toast(msg, null, {
      sub: `Nel cestino per ${GB.cestino.giorni} giorni`,
      action: { label: "Annulla", fn: GB.cestino.annulla },
    });
})();
