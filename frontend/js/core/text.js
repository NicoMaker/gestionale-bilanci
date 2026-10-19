/* Utilità sui testi: plain() toglie maiuscole e accenti, per ricerche tolleranti. */
(function () {
  const GB = window.GB;

  GB.plain = (s) =>
    String(s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
})();
