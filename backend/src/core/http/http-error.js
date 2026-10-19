/* Errore con codice di stato HTTP, convertito in risposta JSON dall'errorHandler. */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = { HttpError };
