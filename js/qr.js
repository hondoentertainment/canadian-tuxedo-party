(function (global) {
  "use strict";

  var QR_OPTIONS = {
    width: 200,
    margin: 1,
    color: { dark: "#1e3354", light: "#faf6ef" },
  };

  function getSiteUrl() {
    return global.CTP && global.CTP.SITE_URL
      ? global.CTP.SITE_URL
      : "https://canadian-tuxedo-party.vercel.app";
  }

  function displayUrl(url) {
    return url.replace(/^https?:\/\//, "");
  }

  function loadQrLibrary(callback) {
    if (global.QRCode) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-qr-lib="true"]');
    if (existing) {
      existing.addEventListener("load", callback);
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js";
    script.setAttribute("data-qr-lib", "true");
    script.onload = callback;
    document.head.appendChild(script);
  }

  function renderCanvas(canvas, url, size) {
    loadQrLibrary(function () {
      global.QRCode.toCanvas(canvas, url, {
        width: size || QR_OPTIONS.width,
        margin: QR_OPTIONS.margin,
        color: QR_OPTIONS.color,
      });
    });
  }

  function initBlock(root) {
    if (!root) {
      return;
    }

    var url = getSiteUrl();
    var img = root.querySelector(".qr-block__img");
    var canvas = root.querySelector(".qr-block__canvas");
    var urlEl = root.querySelector(".qr-block__url");
    var copyBtn = root.querySelector(".qr-block__copy");

    if (urlEl) {
      urlEl.textContent = displayUrl(url);
    }

    if (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-hidden");
        if (canvas) {
          canvas.classList.remove("is-hidden");
          renderCanvas(canvas, url, Number(canvas.dataset.size) || QR_OPTIONS.width);
        }
      });
    } else if (canvas) {
      renderCanvas(canvas, url, Number(canvas.dataset.size) || QR_OPTIONS.width);
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        copyLink(url, copyBtn);
      });
    }
  }

  function copyLink(url, button) {
    var original = button.textContent;

    function done() {
      button.textContent = "Link copied!";
      setTimeout(function () {
        button.textContent = original;
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(function () {
        fallbackCopy(url, button, original);
      });
      return;
    }

    fallbackCopy(url, button, original);
  }

  function fallbackCopy(url, button, original) {
    var input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy");
      button.textContent = "Link copied!";
    } catch (error) {
      button.textContent = displayUrl(url);
    }
    document.body.removeChild(input);
    setTimeout(function () {
      button.textContent = original;
    }, 2000);
  }

  function initAll() {
    document.querySelectorAll("[data-qr-block]").forEach(initBlock);
  }

  global.CTP_QR = {
    initAll: initAll,
    initBlock: initBlock,
    getSiteUrl: getSiteUrl,
    displayUrl: displayUrl,
    renderCanvas: renderCanvas,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})(window);
