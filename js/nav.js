(function () {
  "use strict";

  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");

  if (!toggle || !menu) {
    return;
  }

  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.classList.remove("is-open");
    menu.querySelectorAll(".nav__drop[open]").forEach(function (detail) {
      detail.removeAttribute("open");
    });
  }

  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    menu.classList.toggle("is-open", !open);
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  menu.querySelectorAll(".nav__drop").forEach(function (detail) {
    detail.addEventListener("toggle", function () {
      if (!detail.open) {
        return;
      }

      menu.querySelectorAll(".nav__drop").forEach(function (other) {
        if (other !== detail) {
          other.removeAttribute("open");
        }
      });
    });
  });

  document.addEventListener("click", function (event) {
    if (menu.contains(event.target) || toggle.contains(event.target)) {
      return;
    }

    closeMenu();
  });
})();
