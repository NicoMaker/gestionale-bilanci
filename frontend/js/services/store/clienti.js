/* Store: elenco clienti, selezione cliente/anno e ricarica del dataset. */
(function () {
  const GB = window.GB;
  const { api } = GB;
  const S = GB.store;
  const DEF_PAR = GB.DEF_PAR;

  Object.assign(S, {
    async loadClienti() {
      S.clienti = await api.get("/clienti");
      S.emit("clienti");
      return S.clienti;
    },

    async select(id, anno) {
      if (!id) {
        S.clienteId = null;
        S.cliente = null;
        S.ds = null;
        S.R = null;
        S.M = [];
        S.anni = [];
        S.anno = null;
        localStorage.removeItem("gb.cliente");
        S.emit("context");
        return;
      }
      const raw = await api.get(`/clienti/${id}/dataset`);
      S.clienteId = id;
      S.cliente = raw.cliente;
      S.ds = window.Calc.buildDs(raw);
      S.anni = window.Calc.anni(S.ds);
      const saved = Number(localStorage.getItem("gb.anno." + id));
      S.anno =
        anno ||
        (S.anni.includes(saved)
          ? saved
          : S.anni[S.anni.length - 1] || raw.cliente.anno_base);
      localStorage.setItem("gb.cliente", id);
      S.recompute();
      S.emit("context");
    },
    async reload() {
      return S.select(S.clienteId, S.anno);
    },

    setYear(y) {
      S.anno = Number(y);
      localStorage.setItem("gb.anno." + S.clienteId, S.anno);
      S.recompute();
      S.emit("context");
    },
  });
})();
