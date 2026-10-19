/* Crea elementi SVG: svg(tag, attributi, ...figli). */
(function () {
  const GB = window.GB;

  const NS = "http://www.w3.org/2000/svg";
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else el.setAttribute(k, v);
    }
    for (const c of kids.flat())
      if (c != null)
        el.append(typeof c === "string" ? document.createTextNode(c) : c);
    return el;
  }
  GB.svg = s;
})();
