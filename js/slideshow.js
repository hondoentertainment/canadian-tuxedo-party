(function () {
  "use strict";

  var INTERVAL_MS = 8000;
  var VIDEO_INTERVAL_MS = 20000;
  var REFRESH_MS = 30000;

  var stage = document.getElementById("slideshow-stage");
  var image = document.getElementById("slideshow-image");
  var video = document.getElementById("slideshow-video");
  var caption = document.getElementById("slideshow-caption");
  var empty = document.getElementById("slideshow-empty");
  var status = document.getElementById("slideshow-status");
  var prevBtn = document.getElementById("slideshow-prev");
  var nextBtn = document.getElementById("slideshow-next");
  var pauseBtn = document.getElementById("slideshow-pause");

  var photos = [];
  var index = 0;
  var timer = null;
  var paused = false;

  function mediaTypeFor(item) {
    if (item.mediaType === "video") {
      return "video";
    }
    if (item.contentType && item.contentType.indexOf("video/") === 0) {
      return "video";
    }
    return "image";
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function hideMedia() {
    if (image) {
      image.classList.add("is-hidden");
      image.removeAttribute("src");
    }
    if (video) {
      video.pause();
      video.classList.add("is-hidden");
      video.removeAttribute("src");
      video.load();
    }
  }

  function showCurrent() {
    if (!photos.length) {
      hideMedia();
      if (empty) {
        empty.classList.remove("is-hidden");
      }
      if (caption) {
        caption.classList.add("is-hidden");
      }
      setStatus("Waiting for gallery uploads…");
      return;
    }

    if (empty) {
      empty.classList.add("is-hidden");
    }

    var item = photos[index];
    var isVideo = mediaTypeFor(item) === "video";
    hideMedia();

    if (isVideo && video) {
      video.src = item.url;
      video.classList.remove("is-hidden");
      video.play().catch(function () {
        /* autoplay may be blocked until user interaction */
      });
    } else if (image) {
      image.src = item.url;
      image.alt = item.caption || ("Photo by " + (item.name || "guest"));
      image.classList.remove("is-hidden");
    }

    if (caption) {
      var prefix = isVideo ? "Video" : "Photo";
      var text = item.caption || (item.name ? prefix + " by " + item.name : "");
      if (text) {
        caption.textContent = text;
        caption.classList.remove("is-hidden");
      } else {
        caption.classList.add("is-hidden");
      }
    }

    setStatus(
      (index + 1) +
        " of " +
        photos.length +
        (paused ? " · paused" : " · auto-advancing")
    );
  }

  function currentInterval() {
    if (!photos.length) {
      return INTERVAL_MS;
    }
    return mediaTypeFor(photos[index]) === "video" ? VIDEO_INTERVAL_MS : INTERVAL_MS;
  }

  function nextPhoto() {
    if (!photos.length) {
      return;
    }
    index = (index + 1) % photos.length;
    showCurrent();
  }

  function prevPhoto() {
    if (!photos.length) {
      return;
    }
    index = (index - 1 + photos.length) % photos.length;
    showCurrent();
  }

  function startTimer() {
    if (timer) {
      clearInterval(timer);
    }
    if (!paused && photos.length > 1) {
      timer = setInterval(nextPhoto, currentInterval());
    }
  }

  function loadPhotos() {
    return fetch("/api/photos")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var next = data.photos || [];
        if (next.length === 0) {
          photos = [];
          index = 0;
          showCurrent();
          startTimer();
          return;
        }

        if (photos.length && next[0].id !== photos[0].id) {
          index = 0;
        } else if (index >= next.length) {
          index = 0;
        }

        photos = next;
        showCurrent();
        startTimer();
      })
      .catch(function () {
        setStatus("Could not load photos — retrying…");
      });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      nextPhoto();
      startTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      prevPhoto();
      startTimer();
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener("click", function () {
      paused = !paused;
      pauseBtn.textContent = paused ? "Play" : "Pause";
      pauseBtn.setAttribute("aria-pressed", String(paused));
      showCurrent();
      startTimer();
    });
  }

  if (stage) {
    stage.addEventListener("click", function () {
      if (window.matchMedia("(pointer: fine)").matches) {
        nextPhoto();
        startTimer();
      }
    });
  }

  loadPhotos();
  setInterval(loadPhotos, REFRESH_MS);
})();
