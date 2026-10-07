// Mark the current nav link
(function () {
  var path = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".nav a").forEach(function (a) {
    var target = new URL(a.getAttribute("href"), location.href).pathname.replace(/index\.html$/, "");
    if (target === path) a.setAttribute("aria-current", "page");
  });
})();

// Latest episode (podcast page), embedded from the YouTube playlist.
// data/episodes.json is refreshed daily by .github/workflows/episodes.yml
(function () {
  var latest = document.getElementById("latest");
  if (!latest) return;

  function el(tag, text, cls) {
    var n = document.createElement(tag);
    if (text) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  }

  fetch("../data/episodes.json")
    .then(function (r) { return r.json(); })
    .then(function (eps) {
      if (!eps.length) return;
      var ep = eps[0];
      var date = new Date(ep.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

      var frame = document.createElement("iframe");
      frame.className = "embed";
      frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(ep.id);
      frame.title = ep.title;
      frame.loading = "lazy";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;

      latest.innerHTML = "";
      latest.appendChild(frame);
      latest.appendChild(el("p", date, "meta"));
      latest.appendChild(el("h3", ep.title));
      if (ep.summary) latest.appendChild(el("p", ep.summary));
    })
    .catch(function () {});
})();

// Contact form: posts to the form endpoint set in data-endpoint
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var endpoint = form.getAttribute("data-endpoint");
    if (!endpoint || endpoint.indexOf("TODO") !== -1) {
      status.textContent = "The form is not connected yet. Please use the email address on this page instead.";
      return;
    }
    status.textContent = "Sending…";
    fetch(endpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    }).then(function (r) {
      if (r.ok) { form.reset(); status.textContent = "Message sent. HCD Barcelona will reply within a few working days."; }
      else { status.textContent = "Something went wrong. Please use the email address on this page instead."; }
    }).catch(function () { status.textContent = "Something went wrong. Please use the email address on this page instead."; });
  });
})();
