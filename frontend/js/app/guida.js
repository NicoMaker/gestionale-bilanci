/* Guida del programma: apre il manuale PDF (manuale-utente-gestionale.pdf,
   nella radice del progetto) in una NUOVA scheda del browser.
   Il file viene servito dal backend (vedi backend/src/app.js). */
(function () {
  "use strict";

  const URL_GUIDA = "manuale-utente-gestionale.pdf";

  // Se hai ingrandito il testo (Personalizza → Testo), il PDF si apre con lo
  // stesso zoom (#zoom=… è riconosciuto da Chrome, Edge e Firefox).
  function urlConZoom() {
    try {
      const t =
        window.GB_PERSONALIZZA && window.GB_PERSONALIZZA.stato
          ? window.GB_PERSONALIZZA.stato().misure.testo
          : 100;
      return t && t !== 100 ? `${URL_GUIDA}#zoom=${t}` : URL_GUIDA;
    } catch (_) {
      return URL_GUIDA;
    }
  }

  // Apre SEMPRE in una nuova scheda con un <a target="_blank">:
  // i browser non lo bloccano mai come popup.
  function apriGuida() {
    const a = document.createElement("a");
    a.href = urlConZoom();
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 0);
  }
  window.apriGuida = apriGuida;
})();
