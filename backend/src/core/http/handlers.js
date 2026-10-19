/* Middleware finali: 404 per endpoint sconosciuti e gestione centrale degli errori. */
const notFound = (req, res) =>
  res.status(404).json({ error: "Endpoint non trovato" });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error("❌", err);
  res.status(status).json({ error: err.message || "Errore interno" });
};

module.exports = { notFound, errorHandler };
