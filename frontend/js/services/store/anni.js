/* Store: aggiunta ed eliminazione degli esercizi. */
(function () {
  const GB = window.GB;
  const { api } = GB;
  const S = GB.store;
  const DEF_PAR = GB.DEF_PAR;

  Object.assign(S, {
    // anno e data (AAAA-MM-GG) sono facoltativi: senza anno si aggiunge il successivo, senza data si chiude il 31/12
    async addAnno(anno, data) {
      const body = {};
      if (anno) body.anno = anno;
      if (data) body.data_chiusura = data;
      const r = await S._save(api.post(`/clienti/${S.clienteId}/anni`, body));
      S.ds.par[r.anno] = Object.assign({}, DEF_PAR, {
        data_chiusura: r.data_chiusura || r.anno + "-12-31",
      });
      S.anno = r.anno;
      localStorage.setItem("gb.anno." + S.clienteId, S.anno);
      S.recompute();
      S.emit("context");
      return r.anno;
    },
    // cambia la data di chiusura di un esercizio (vuota = 31/12); ricalcola e ridisegna tutte le pagine
    async saveDataChiusura(anno, data) {
      const r = await S._save(
        api.put(
          `/clienti/${S.clienteId}/anni/${anno}/data-chiusura`,
          data ? { data_chiusura: data } : {},
        ),
      );
      S.ds.par[anno] = Object.assign({}, DEF_PAR, S.ds.par[anno] || {}, {
        data_chiusura: r.data_chiusura,
      });
      S.changed();
      S.emit("context");
      return r.data_chiusura;
    },
    // cambia insieme le date di chiusura di più esercizi: { anno: "AAAA-MM-GG" | "" }; ridisegna una sola volta
    async saveDateChiusura(mappa) {
      const anni = Object.keys(mappa).map(Number);
      const res = await S._save(
        Promise.all(
          anni.map((anno) =>
            api.put(
              `/clienti/${S.clienteId}/anni/${anno}/data-chiusura`,
              mappa[anno] ? { data_chiusura: mappa[anno] } : {},
            ),
          ),
        ),
      );
      anni.forEach((anno, i) => {
        S.ds.par[anno] = Object.assign({}, DEF_PAR, S.ds.par[anno] || {}, {
          data_chiusura: res[i].data_chiusura,
        });
      });
      S.changed();
      S.emit("context");
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
