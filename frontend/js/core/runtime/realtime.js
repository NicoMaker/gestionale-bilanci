/* Aggiornamento in tempo reale (socket.io): quando un altro browser/scheda/dispositivo modifica dei dati,
   questa pagina ricarica clienti e dati del cliente aperto e si ridisegna da sola.
   Non interrompe chi sta scrivendo: se c'è un campo in modifica, una finestra aperta o un salvataggio in corso, aspetta. */
(function () {
  const GB = window.GB;
  const S = GB.store;

  let socket = null;
  let inAttesa = false; // c'è una modifica altrui da recepire
  let timer = null;
  let aggiornando = false;
  let cliente = undefined; // cliente toccato dalle modifiche in attesa (null = non si sa → ricarica quello aperto)

  const staScrivendo = () => {
    const a = document.activeElement;
    const campo =
      a &&
      a !== document.body &&
      /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) &&
      !!a.closest("#content, .overlay");
    return campo || !!document.querySelector(".overlay") || GB.api.inCorso > 0;
  };

  async function aggiorna() {
    if (aggiornando) return;
    aggiornando = true;
    const toccato = cliente;
    inAttesa = false;
    cliente = undefined;
    try {
      await S.loadClienti();
      if (S.clienteId && !S.clienti.some((c) => c.id === S.clienteId)) {
        await S.select(null); // il cliente aperto è stato eliminato altrove
      } else if (S.clienteId && (toccato == null || toccato === S.clienteId)) {
        await S.reload();
      } else if (GB.app && GB.app.render && GB.routeKey() === "cestino") {
        // Panoramica e Clienti si ridisegnano già da soli quando arriva l'elenco clienti (evento «clienti»); il Cestino no
        GB.app.render();
      }
      GB.cestino && GB.cestino.refresh();
    } catch (e) {
      console.error("Aggiornamento in tempo reale:", e);
    } finally {
      aggiornando = false;
      if (inAttesa) pianifica();
    }
  }

  /* Raggruppa più avvisi ravvicinati (es. eliminazione multipla) e rimanda se l'utente sta scrivendo. */
  function pianifica(ms = 250) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (staScrivendo()) return pianifica(1200);
      aggiorna();
    }, ms);
  }

  function connetti() {
    if (typeof window.io !== "function") return; // client socket.io non caricato: l'app funziona comunque, senza tempo reale
    socket = window.io();
    let giaConnesso = false;
    socket.on("connect", () => {
      GB.setConn && GB.setConn(true);
      // dopo una riconnessione si potrebbero essere perse delle modifiche: ricarica
      if (giaConnesso) {
        inAttesa = true;
        cliente = null;
        pianifica(100);
      }
      giaConnesso = true;
    });
    socket.on("disconnect", () => GB.setConn && GB.setConn(false));
    socket.on("dati:cambiati", (p) => {
      const c = p && p.cliente_id != null ? p.cliente_id : null;
      // più avvisi per clienti diversi → non si sa quale: ricarica quello aperto
      cliente = inAttesa && cliente !== c ? null : c;
      inAttesa = true;
      pianifica();
    });
  }

  // finito di scrivere (campo abbandonato) o chiusa una finestra: se c'era qualcosa in attesa, aggiorna
  document.addEventListener("focusout", () => {
    if (inAttesa) pianifica(400);
  });

  GB.realtime = {
    id: () => (socket && socket.connected ? socket.id : null),
    aggiorna: pianifica,
  };
  connetti();
})();
