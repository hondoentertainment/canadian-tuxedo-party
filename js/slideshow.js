(function () {
  "use strict";

  var INTERVAL_MS = 8000;
  var REFRESH_MS = 30000;

  var stage = document.getElementById("slideshow-stage");
  var image = document.getElementById("slideshow-image");
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

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function showCurrent() {
    if (!photos.length) {
      if (empty) {
        empty.classList.remove("is-hidden");
      }
      if (image) {
        image.classList.add("is-hidden");
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

    var photo = photos[index];
    if (image) {
      image.src = photo.url;
      image.alt = photo.caption || ("Photo by " + (photo.name || "guest"));
      image.classList.remove("is-hidden");
    }

    if (caption) {
      var text = photo.caption || (photo.name ? "Photo by " + photo.name : "");
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
      timer = setInterval(nextPhoto, INTERVAL_MS);
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
