(function () {
  const GB = window.GB;
  async function call(method, url, body) {
    let res;
    try {
      res = await fetch("/api" + url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    } catch (e) {
      GB.setConn && GB.setConn(false);
      throw new Error("Server non raggiungibile");
    }
    GB.setConn && GB.setConn(true);
    let data = null;
    try { data = await res.json(); } catch (e) { /* no body */ }
    if (!res.ok) throw new Error((data && data.error) || "Errore " + res.status);
    return data;
  }
  GB.api = {
    get: (u) => call("GET", u),
    post: (u, b) => call("POST", u, b || {}),
    put: (u, b) => call("PUT", u, b || {}),
    del: (u) => call("DELETE", u),
  };
})();
