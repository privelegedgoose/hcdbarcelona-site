// Mark the current nav link
(function () {
  var path = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".nav a").forEach(function (a) {
    var target = new URL(a.getAttribute("href"), location.href).pathname.replace(/index\.html$/, "");
    if (target === path) a.setAttribute("aria-current", "page");
  });
})();

// Episodes list (podcast page): rendered from data/episodes.json
(function () {
  var list = document.getElementById("episodes");
  if (!list) return;
  fetch("../data/episodes.json")
    .then(function (r) { return r.json(); })
    .then(function (eps) {
      if (!eps.length) return;
      list.innerHTML = "";
      eps.forEach(function (e) {
        var li = document.createElement("li");
        var links = (e.links || []).map(function (l) {
          return '<a href="' + l.url + '" rel="noopener">' + l.label + "</a>";
        }).join(" · ");
        li.innerHTML =
          '<div class="meta">' + e.date + (e.guest ? " · " + e.guest : "") + "</div>" +
          "<h3>" + e.title + "</h3><p>" + e.summary + "</p>" +
          (links ? "<p>" + links + "</p>" : "");
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
