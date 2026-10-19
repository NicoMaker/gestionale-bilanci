/* Store: salvataggio con ripristino dal server in caso di errore. */
(function () {
  const GB = window.GB;
  const { api } = GB;
  const S = GB.store;
  const DEF_PAR = GB.DEF_PAR;

  Object.assign(S, {
    async _save(promise) {
      try {
        return await promise;
      } catch (e) {
        GB.toast(e.message, "err");
        await S.reload();
        throw e;
      }
    },
  });
})();
