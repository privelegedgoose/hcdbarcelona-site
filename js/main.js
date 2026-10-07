// Mark the current nav link
(function () {
  var path = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".nav a").forEach(function (a) {
    var target = new URL(a.getAttribute("href"), location.href).pathname.replace(/index\.html$/, "");
    if (target === path) a.setAttribute("aria-current", "page");
  });
})();

// Episodes (podcast page): latest episode embedded, earlier ones listed.
// data/episodes.json is refreshed daily from the YouTube playlist by
// .github/workflows/episodes.yml
(function () {
  var list = document.getElementById("episodes");
  var latest = document.getElementById("latest");
  if (!list || !latest) return;

  function el(tag, text, cls) {
    var n = document.createElement(tag);
    if (text) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  }
  function when(iso) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  fetch("../data/episodes.json")
    .then(function (r) { return r.json(); })
    .then(function (eps) {
      if (!eps.length) return;
      var first = eps[0];

      var frame = document.createElement("iframe");
      frame.className = "embed";
      frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(first.id);
      frame.title = first.title;
      frame.loading = "lazy";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;
      latest.appendChild(frame);
      latest.appendChild(el("p", when(first.date), "meta"));
      latest.appendChild(el("h3", first.title));
      if (first.summary) latest.appendChild(el("p", first.summary));

      list.innerHTML = "";
      var rest = eps.slice(1);
      if (!rest.length) { list.remove(); return; }
      rest.forEach(function (e) {
        var li = document.createElement("li");
        li.appendChild(el("div", when(e.date), "meta"));
        var h = document.createElement("h3");
        var a = document.createElement("a");
        a.href = e.url; a.rel = "noopener"; a.textContent = e.title;
        h.appendChild(a);
        li.appendChild(h);
        if (e.summary) li.appendChild(el("p", e.summary));
        list.appendChild(li);
      });
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
