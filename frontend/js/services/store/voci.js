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
      GB.deleted("Riga eliminata");
    },
    // elimina più righe insieme (con tutti i loro valori)
    async deleteVoci(ids) {
      if (!ids.length) return;
      await S._save(api.post(`/clienti/${S.clienteId}/voci/elimina`, { ids }));
      const out = new Set(ids);
      S.ds.voci = S.ds.voci.filter((x) => !out.has(x.id));
      ids.forEach((id) => {
        delete S.ds.val[id];
        delete S.ds.bvar[id];
        delete S.ds.cf[id];
      });
      S.recompute();
      S.emit("structure");
      GB.deleted(
        ids.length === 1 ? "Riga eliminata" : `${ids.length} righe eliminate`,
      );
    },
    /* cancella i valori di più righe senza eliminarle.
       cosa: "valori" (importi di tutti gli esercizi) | "cashflow" | "budget" (solo l'anno di riferimento `anno`) */
    async clearVoci(ids, cosa, anno) {
      if (!ids.length) return;
      await S._save(
        api.post(`/clienti/${S.clienteId}/voci/azzera`, { ids, cosa, anno }),
      );
      ids.forEach((id) => {
        if (cosa === "valori") delete S.ds.val[id];
        else if (cosa === "budget") {
          if (S.ds.bvar[id]) delete S.ds.bvar[id][anno];
        } else if (S.ds.cf[id]) delete S.ds.cf[id][anno];
      });
      S.recompute();
      S.emit("structure");
      GB.deleted("Valori azzerati");
    },
    // azzera le vendite dei mesi (1..12) e/o degli anni indicati
    async clearVendite({ mesi, anni }) {
      await S._save(
        api.post(`/clienti/${S.clienteId}/vendite/azzera`, { mesi, anni }),
      );
      Object.keys(S.ds.vend).forEach((a) => {
        if (anni && !anni.includes(Number(a))) return;
        (S.ds.vend[a] || []).forEach((_, m) => {
          if (!mesi || mesi.includes(m + 1)) S.ds.vend[a][m] = 0;
        });
      });
      S.recompute();
      S.emit("structure");
      GB.deleted("Vendite azzerate");
    },
    // riporta a zero uno o più parametri di un anno (saldo banca, imposte, inflazione…)
    async clearParams(anno, campi) {
      await S._save(
        api.post(`/clienti/${S.clienteId}/parametri/azzera`, { anno, campi }),
      );
      campi.forEach((c) => {
        if (S.ds.par[anno]) S.ds.par[anno][c] = c === "peso_vendite" ? 1 : 0;
      });
      S.recompute();
      S.emit("structure");
      GB.deleted("Parametri azzerati");
    },
  });
})();
