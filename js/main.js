(function () {
  "use strict";

  const PARTY_DATE = new Date(window.CTP ? window.CTP.PARTY_DATE : "2026-05-30T18:30:00-07:00");

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const countdownEl = document.querySelector(".countdown");
  const postPartyEl = document.getElementById("post-party");
  const heroEyebrow = document.getElementById("hero-eyebrow");
  const heroTagline = document.getElementById("hero-tagline");
  const partyNightEl = document.getElementById("party-night");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function isPostParty() {
    return Date.now() >= PARTY_DATE.getTime();
  }

  function applyPostPartyMode() {
    if (!isPostParty()) {
      return;
    }

    document.body.classList.add("is-post-party");

    if (heroEyebrow) {
      heroEyebrow.innerHTML =
        '<span class="star" aria-hidden="true">★</span> Thanks for Coming <span class="star" aria-hidden="true">★</span>';
    }

    if (heroTagline) {
      heroTagline.textContent = "Relive the denim, share photos, and help us plan the next one.";
    }

    if (countdownEl) {
      countdownEl.classList.add("is-hidden");
    }

    if (postPartyEl) {
      postPartyEl.classList.remove("is-hidden");
    }

    if (partyNightEl) {
      partyNightEl.querySelector(".party-night__heading").textContent = "Keep the Party Going";
      partyNightEl.querySelector(".party-night__lead").textContent =
        "Upload photos, vote for best dressed, and tell us when to do it all again.";
    }
  }

  function updateCountdown() {
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
      return;
    }

    if (isPostParty()) {
      applyPostPartyMode();
      return;
    }

    const diff = PARTY_DATE.getTime() - Date.now();
    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      applyPostPartyMode();
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
  applyPostPartyMode();

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

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {
        /* offline support is optional */
      });
    });
  }
})();
