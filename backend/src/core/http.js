/* Errori HTTP e middleware comuni (async wrapper, 404, gestione errori). */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const wrap = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next);
  } catch (e) {
    next(e);
  }
};

const notFound = (req, res) =>
  res.status(404).json({ error: "Endpoint non trovato" });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error("❌", err);
  res.status(status).json({ error: err.message || "Errore interno" });
};

module.exports = { HttpError, wrap, notFound, errorHandler };
