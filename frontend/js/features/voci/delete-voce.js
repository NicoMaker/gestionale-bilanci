/* Eliminazione di una riga di conto, con conferma se contiene dati. */
(function () {
  const GB = window.GB;

  // elimina una riga: se non contiene dati si elimina subito, altrimenti si chiede conferma indicando quanti valori si perdono
  GB.deleteVoceFlow = async (v) => {
    const S = GB.store;
    const nz = (o) =>
      Object.values(o || {}).filter((x) => x !== null && x !== undefined)
        .length;
    let n = nz(S.ds.val[v.id]) + nz(S.ds.bvar[v.id]);
    for (const arr of Object.values(S.ds.cf[v.id] || {}))
      n += arr.filter((x) => x).length;
    if (n === 0) return S.deleteVoce(v.id).catch(() => {});
    if (
      await GB.confirm(
        `La riga “${v.descrizione || "(senza nome)"}” contiene ${n} valori inseriti. Eliminarla insieme ai suoi dati?`,
      )
    )
      S.deleteVoce(v.id).catch(() => {});
  };
})();
