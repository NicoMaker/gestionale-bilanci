/* Stato applicazione: clienti, cliente/anno selezionati, dataset, risultati di calcolo + eventi (on/emit). */
(function () {
  const GB = window.GB;

  const listeners = {};
  GB.DEF_PAR = {
    peso_vendite: 1,
    inflazione: 0,
    produttivita: 0,
    imposte_budget: 0,
    investimento: 0,
    aumento_utile: 0,
    saldo_iniziale_cf: 0,
  };

  GB.store = {
    clienti: [],
    clienteId: null,
    cliente: null,
    anno: null,
    ds: null,
    R: null,
    anni: [],
    M: [], // calcoli per ogni esercizio (vedi recompute)

    on(ev, fn) {
      (listeners[ev] = listeners[ev] || []).push(fn);
    },
    emit(ev, p) {
      (listeners[ev] || []).forEach((fn) => fn(p));
    },
  };
})();
