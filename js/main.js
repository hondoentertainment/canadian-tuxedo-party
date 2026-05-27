(function () {
  "use strict";

  const PARTY_DATE = new Date("2026-05-30T18:30:00-07:00");
  const SITE_URL = "https://canadian-tuxedo-party.vercel.app";

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

  /* QR code */
  const qrCanvas = document.getElementById("qr-code");
  const qrUrlEl = document.getElementById("qr-url");

  if (qrCanvas) {
    if (qrUrlEl) {
      qrUrlEl.textContent = SITE_URL.replace(/^https?:\/\//, "");
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js";
    script.onload = function () {
      QRCode.toCanvas(qrCanvas, SITE_URL, {
        width: 160,
        margin: 1,
        color: { dark: "#1e3354", light: "#faf6ef" },
      });
    };
    document.head.appendChild(script);
  }

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
})();
