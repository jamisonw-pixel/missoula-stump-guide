/*
 * Missoula Stump Guide — minimal progressive-enhancement JS.
 * No third-party scripts, no trackers, no ad pixels. Inquiry path honors
 * HOLD_AND_DO_NOT_SHARE and stays truthful when no destination is configured.
 */
(function () {
  "use strict";

  // Mark the current nav item.
  try {
    var here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll('nav.primary a[href]').forEach(function (a) {
      var target = a.getAttribute("href").split("/").pop();
      if (target === here) a.setAttribute("aria-current", "page");
    });
  } catch (e) { /* non-fatal */ }

  var form = document.getElementById("inquiry-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var cfg = window.SITE_CONFIG || {};

  function setStatus(kind, msg) {
    if (!statusEl) return;
    statusEl.className = "form-status show " + kind;
    statusEl.textContent = msg;
    statusEl.focus && statusEl.focus();
  }

  var configured = Boolean((cfg.formEndpoint && cfg.formEndpoint.trim()) ||
                           (cfg.publisherEmail && cfg.publisherEmail.trim()));

  if (!configured) {
    // Honest state: do not accept or discard data before a real destination exists.
    var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setStatus("info",
      "This request form is not accepting online submissions yet. Missoula Stump Guide is a " +
      "brand-new independent information resource, and no provider is currently assigned to requests. " +
      "Please check back soon. If you need stump service now, contact a local provider directly.");
    return;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var data = new FormData(form);

    if (cfg.formEndpoint && cfg.formEndpoint.trim()) {
      setStatus("info", "Sending your request…");
      fetch(cfg.formEndpoint.trim(), {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          setStatus("ok",
            "Thank you — your request was received by the publisher. It is held and is not sent to a " +
            "contractor. No provider is currently assigned; you may not receive a service call.");
        } else {
          throw new Error("bad status " + r.status);
        }
      }).catch(function () {
        setStatus("err",
          "Sorry — your request could not be submitted right now. Please try again later.");
      });
      return;
    }

    // mailto fallback: opens the visitor's own email client to the publisher inbox.
    var lines = [];
    data.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ": " + v); });
    var subject = "Stump service request (Missoula Stump Guide)";
    var href = "mailto:" + encodeURIComponent(cfg.publisherEmail.trim()) +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    window.location.href = href;
    setStatus("info",
      "Your email app should open a draft addressed to the publisher. Send that email to deliver your " +
      "request; it has not been submitted by this website. Once received, it is held by the publisher " +
      "and is not sent to a contractor.");
  });
})();
