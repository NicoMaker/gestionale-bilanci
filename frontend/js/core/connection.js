/* Indicatore di connessione al server nella barra laterale. */
(function () {
  const GB = window.GB;

  GB.setConn = (ok) => {
    const d = document.getElementById("conn");
    if (d) d.classList.toggle("off", !ok);
    const t = document.getElementById("conn-t");
    if (t)
      t.textContent = ok ? "Database connesso" : "Server non raggiungibile";
  };
})();
