(function () {
  "use strict";

  const PARTY_DATE = new Date("2026-05-30T18:30:00-07:00");

  /* Countdown */
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateCountdown() {
    const now = Date.now();
    const diff = PARTY_DATE.getTime() - now;

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

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

  /* RSVP form */
  const form = document.getElementById("rsvp-form");
  const status = document.getElementById("form-status");

  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const guests = form.guests.value;

      if (!name || !email || !guests) {
        status.textContent = "Please fill in all required fields.";
        status.className = "form-note form-note--error";
        return;
      }

      const denimLevel = form["denim-level"].value;
      const message = form.message.value.trim();

      const subject = encodeURIComponent("Canadian Tuxedo Party RSVP — " + name);
      const bodyLines = [
        "Name: " + name,
        "Email: " + email,
        "Guests: " + guests,
        "Denim level: " + (denimLevel || "Not specified"),
        "",
        message ? "Message:\n" + message : "",
      ].filter(Boolean);

      const mailto = "mailto:?subject=" + subject + "&body=" + encodeURIComponent(bodyLines.join("\n"));

      status.textContent = "Opening your email app to send your RSVP…";
      status.className = "form-note form-note--success";

      window.location.href = mailto;

      setTimeout(function () {
        status.textContent = "Thanks! If your email app didn't open, email us directly with your RSVP details.";
      }, 2000);
    });
  }
})();
