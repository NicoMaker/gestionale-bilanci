/* Store: aggiunta ed eliminazione degli esercizi. */
(function () {
  const GB = window.GB;
  const { api } = GB;
  const S = GB.store;
  const DEF_PAR = GB.DEF_PAR;

  Object.assign(S, {
    async addAnno() {
      const r = await S._save(api.post(`/clienti/${S.clienteId}/anni`, {}));
      S.ds.par[r.anno] = Object.assign({}, DEF_PAR);
      S.anno = r.anno;
      localStorage.setItem("gb.anno." + S.clienteId, S.anno);
      S.recompute();
      S.emit("context");
      return r.anno;
    },
    async deleteAnno(anno, conConferma) {
      await S._save(
        api.del(
          `/clienti/${S.clienteId}/anni/${anno}` +
            (conConferma ? "?conferma=1" : ""),
        ),
      );
      S.anno = null;
      await S.select(S.clienteId, null);
      GB.deleted(`Esercizio ${anno} eliminato`);
    },
  });
})();
