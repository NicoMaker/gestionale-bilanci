/* Middleware: alla prima richiesta di ogni anno solare aggiorna gli esercizi di tutti i clienti
   (così il server può restare acceso a cavallo di capodanno). */
const { annoCorrente, sincronizzaTutti } = require("./sincronizza");

let annoSincronizzato = null;

function autoSync(req, res, next) {
  const anno = annoCorrente();
  if (annoSincronizzato !== anno) {
    try {
      sincronizzaTutti();
      annoSincronizzato = anno;
    } catch (e) {
      return next(e);
    }
  }
  next();
}

module.exports = { autoSync };
