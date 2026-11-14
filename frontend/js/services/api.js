(function () {
  const GB = window.GB;
  async function call(method, url, body) {
    let res;
    // il server non rimanda l'avviso «dati cambiati» a chi ha fatto la modifica (X-Socket-Id)
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    const sid = GB.realtime && GB.realtime.id();
    if (sid) headers["X-Socket-Id"] = sid;
    GB.api.inCorso++;
    try {
      res = await fetch("/api" + url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      GB.setConn && GB.setConn(false);
      throw new Error("Server non raggiungibile");
    } finally {
      GB.api.inCorso--;
    }
    GB.setConn && GB.setConn(true);
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      /* no body */
    }
    if (!res.ok)
      throw new Error((data && data.error) || "Errore " + res.status);
    // eliminazioni e azzeramenti finiscono nel cestino: aggiorna il contatore nel menu
    if ((method === "POST" || method === "DELETE") && GB.cestino)
      GB.cestino.refresh();
    return data;
  }
  GB.api = {
    inCorso: 0, // richieste in volo: l'aggiornamento in tempo reale aspetta che finiscano
    get: (u) => call("GET", u),
    post: (u, b) => call("POST", u, b || {}),
    put: (u, b) => call("PUT", u, b || {}),
    del: (u) => call("DELETE", u),
  };
})();
