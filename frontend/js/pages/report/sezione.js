/* Una sezione del report: titolo (solo a video) e la pagina corrispondente in sola lettura. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.parts.report.sezione = function (container, k, ups) {
    const p = GB.pages[k];
    const sec = h(
      "section",
      { class: "report-sec" },
      h(
        "h2",
        {
          class: "no-print",
          style: { fontFamily: "var(--serif)", margin: "26px 0 12px" },
        },
        p.icon + " " + p.title,
      ),
    );
    container.append(sec);
    const r = p.render(sec, true);
    if (r && r.update) ups.push(r.update);
  };
})();
