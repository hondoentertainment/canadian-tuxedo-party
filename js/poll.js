(function () {
  "use strict";

  /* Mobile nav */
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      menu.classList.toggle("is-open", !open);
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        menu.classList.remove("is-open");
      });
    });
  }

  /* Poll form */
  const form = document.getElementById("poll-form");
  const status = document.getElementById("poll-status");

  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const selectedDates = Array.from(form.querySelectorAll('input[name="dates"]:checked')).map(function (input) {
        return input.value;
      });
      const feedback = form.feedback.value.trim();

      if (selectedDates.length === 0) {
        status.textContent = "Please pick at least one date (or an other option).";
        status.className = "form-note form-note--error";
        return;
      }

      const subject = encodeURIComponent(
        "Next Party Poll" + (name ? " — " + name : "")
      );
      const bodyLines = [
        name ? "Name: " + name : "Name: (not provided)",
        email ? "Email: " + email : "Email: (not provided)",
        "",
        "Preferred dates:",
        ...selectedDates.map(function (date) {
          return "• " + date;
        }),
        "",
        feedback ? "Feedback on May party:\n" + feedback : "Feedback on May party: (none provided)",
      ];

      const mailto = "mailto:?subject=" + subject + "&body=" + encodeURIComponent(bodyLines.join("\n"));

      status.textContent = "Opening your email app to send your poll response…";
      status.className = "form-note form-note--success";

      window.location.href = mailto;

      setTimeout(function () {
        status.textContent = "Thanks! If your email app didn't open, send us your date picks and feedback directly.";
      }, 2000);
    });
  }
})();
