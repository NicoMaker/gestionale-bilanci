/* Client HTTP minimale per le chiamate alle API di test. */
const base = "http://localhost:3999/api";

const api = async (m, u, b) => {
  const r = await fetch(base + u, {
    method: m,
    headers: { "Content-Type": "application/json" },
    body: b ? JSON.stringify(b) : undefined,
  });
  const j = await r.json().catch(() => null);
  return { status: r.status, body: j };
};

module.exports = { base, api };
