/* Store: righe di conto (aggiunta, modifica, eliminazione). */
(function () {
  const GB = window.GB;
  const { api } = GB;
  const S = GB.store;
  const DEF_PAR = GB.DEF_PAR;

  Object.assign(S, {
    async addVoce(ambito, sezione, extra) {
      const v = await S._save(
        api.post(
          `/clienti/${S.clienteId}/voci`,
          Object.assign({ ambito, sezione }, extra || {}),
        ),
      );
      S.ds.voci = S.ds.voci.concat(v);
      GB.focusVoce = v.id;
      S.recompute();
      S.emit("structure");
      return v;
    },
    async updateVoce(id, patch) {
      const v = S.ds.voci.find((x) => x.id === id);
      Object.assign(v, patch);
      if ("tipo" in patch) S.changed();
      return S._save(api.put(`/voci/${id}`, patch));
    },
    async deleteVoce(id) {
      await S._save(api.del(`/voci/${id}`));
      S.ds.voci = S.ds.voci.filter((x) => x.id !== id);
      delete S.ds.val[id];
      delete S.ds.bvar[id];
      delete S.ds.cf[id];
      S.recompute();
      S.emit("structure");
    },
  });
})();
