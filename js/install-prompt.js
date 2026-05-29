(function () {
  "use strict";

  var DISMISS_KEY = "ctp-install-dismissed";
  var banner = document.getElementById("install-banner");
  var installBtn = document.getElementById("install-banner-btn");
  var dismissBtn = document.getElementById("install-banner-dismiss");
  var deferredPrompt = null;

  if (!banner || window.matchMedia("(display-mode: standalone)").matches) {
    return;
  }

  if (localStorage.getItem(DISMISS_KEY)) {
    return;
  }

  function showBanner() {
    banner.classList.remove("is-hidden");
  }

  function hideBanner() {
    banner.classList.add("is-hidden");
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    showBanner();
  });

  if (installBtn) {
    installBtn.addEventListener("click", function () {
      if (!deferredPrompt) {
        return;
      }

      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
        hideBanner();
        localStorage.setItem(DISMISS_KEY, "1");
      });
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener("click", function () {
      hideBanner();
      localStorage.setItem(DISMISS_KEY, "1");
    });
  }

  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    setTimeout(function () {
      if (!deferredPrompt && !localStorage.getItem(DISMISS_KEY)) {
        showBanner();
        if (installBtn && !installBtn.dataset.fallbackBound) {
          installBtn.dataset.fallbackBound = "true";
          installBtn.textContent = "How to install";
          installBtn.addEventListener("click", function () {
            alert(
              "Add to Home Screen:\n\n" +
                "• iPhone: Share button → Add to Home Screen\n" +
                "• Android: Browser menu → Install app / Add to Home Screen"
            );
          });
        }
      }
    }, 2500);
  }
})();
