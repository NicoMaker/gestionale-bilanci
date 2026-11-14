/* Aggiornamento in tempo reale (socket.io): dopo ogni modifica riuscita (POST/PUT/DELETE) avvisa tutti gli altri browser collegati,
   che ricaricano i dati. Chi ha fatto la modifica NON riceve l'avviso (header X-Socket-Id): la sua pagina è già aggiornata. */
const { Server } = require("socket.io");

const EVENTO = "dati:cambiati";
let io = null;

/* Collega socket.io al server HTTP (si chiama una volta, dopo app.listen). */
function attach(server) {
  io = new Server(server, { serveClient: true });
  return io;
}

/* /clienti/12/valore → 12 ; le rotte senza cliente (es. /voci/5) → null: i browser ricaricano comunque il cliente aperto. */
function clienteDaPercorso(path) {
  const m = /^\/clienti\/(\d+)/.exec(path);
  return m ? Number(m[1]) : null;
}

function notifica(payload, daEscludere) {
  if (!io) return;
  (daEscludere ? io.except(daEscludere) : io).emit(EVENTO, payload);
}

/* Middleware Express: a risposta conclusa con successo, se la richiesta ha modificato dati, manda l'avviso. */
function middleware(req, res, next) {
  const modifica = !["GET", "HEAD", "OPTIONS"].includes(req.method);
  if (modifica)
    res.on("finish", () => {
      if (res.statusCode >= 400) return;
      notifica(
        {
          metodo: req.method,
          percorso: req.path,
          cliente_id: clienteDaPercorso(req.path),
          ts: Date.now(),
        },
        req.get("x-socket-id") || null,
      );
    });
  next();
}

module.exports = { attach, middleware, notifica, EVENTO };
