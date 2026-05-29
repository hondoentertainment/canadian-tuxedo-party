(function () {
  "use strict";

  var DB_NAME = "ctp-gallery";
  var DB_VERSION = 1;
  var STORE = "photos";
  var apiAvailable = null;

  /* Gallery elements */
  var form = document.getElementById("gallery-form");
  var status = document.getElementById("gallery-status");
  var fileInput = document.getElementById("gallery-file");
  var dropZone = document.getElementById("gallery-drop");
  var dropContent = document.getElementById("gallery-drop-content");
  var previewWrap = document.getElementById("gallery-preview");
  var previewImg = document.getElementById("gallery-preview-img");
  var clearBtn = document.getElementById("gallery-clear");
  var submitBtn = document.getElementById("gallery-submit");
  var grid = document.getElementById("gallery-grid");
  var emptyEl = document.getElementById("gallery-empty");
  var countEl = document.getElementById("gallery-count");
  var lightbox = document.getElementById("gallery-lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");

  var selectedFile = null;
  var previewUrl = null;

  function setStatus(message, type) {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.className = "form-note" + (type ? " form-note--" + type : "");
  }

  function openDb() {
    return new Promise(function (resolve, reject) {
      var request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function () {
        reject(request.error);
      };
    });
  }

  function idbGetAll() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var store = tx.objectStore(STORE);
        var request = store.getAll();
        request.onsuccess = function () {
          resolve(request.result || []);
        };
        request.onerror = function () {
          reject(request.error);
        };
      });
    });
  }

  function idbPut(photo) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(photo);
        tx.oncomplete = function () {
          resolve();
        };
        tx.onerror = function () {
          reject(tx.error);
        };
      });
    });
  }

  function checkApi() {
    if (apiAvailable !== null) {
      return Promise.resolve(apiAvailable);
    }
    return fetch("/api/photos")
      .then(function (response) {
        apiAvailable = response.ok;
        return apiAvailable;
      })
      .catch(function () {
        apiAvailable = false;
        return false;
      });
  }

  function loadPhotos() {
    return checkApi().then(function (hasApi) {
      if (hasApi) {
        return fetch("/api/photos")
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            return data.photos || [];
          });
      }
      return idbGetAll().then(function (photos) {
        return photos.sort(function (a, b) {
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        });
      });
    });
  }

  function renderGallery(photos) {
    if (!grid || !emptyEl || !countEl) {
      return;
    }

    grid.innerHTML = "";

    if (photos.length === 0) {
      emptyEl.classList.remove("is-hidden");
      countEl.textContent = "No photos yet";
      return;
    }

    emptyEl.classList.add("is-hidden");
    countEl.textContent =
      photos.length === 1 ? "1 photo shared" : photos.length + " photos shared";

    photos.forEach(function (photo) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "gallery-item";
      item.setAttribute("aria-label", "View photo by " + photo.name);

      var img = document.createElement("img");
      img.src = photo.url;
      img.alt = photo.caption || ("Photo by " + photo.name);
      img.loading = "lazy";

      var meta = document.createElement("span");
      meta.className = "gallery-item__meta";
      meta.textContent = photo.name;

      item.appendChild(img);
      item.appendChild(meta);

      item.addEventListener("click", function () {
        openLightbox(photo);
      });

      grid.appendChild(item);
    });
  }

  function refreshGallery() {
    return loadPhotos().then(renderGallery);
  }

  function openLightbox(photo) {
    if (!lightbox || !lightboxImg || !lightboxCaption) {
      return;
    }
    lightboxImg.src = photo.url;
    lightboxImg.alt = photo.caption || ("Photo by " + photo.name);
    lightboxCaption.textContent = photo.caption
      ? photo.name + " — " + photo.caption
      : photo.name;
    lightbox.showModal();
  }

  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener("click", function () {
      lightbox.close();
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        lightbox.close();
      }
    });
    lightbox.addEventListener("cancel", function () {
      lightboxImg.removeAttribute("src");
    });
  }

  function clearPreview() {
    selectedFile = null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    if (fileInput) {
      fileInput.value = "";
      fileInput.style.pointerEvents = "";
    }
    if (previewWrap) {
      previewWrap.classList.add("is-hidden");
    }
    if (dropContent) {
      dropContent.classList.remove("is-hidden");
    }
  }

  function setPreview(file) {
    if (!file || !file.type.startsWith("image/")) {
      setStatus("Please choose a valid image file.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus("Photo must be 10 MB or smaller.", "error");
      return;
    }

    selectedFile = file;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    previewUrl = URL.createObjectURL(file);
    previewImg.src = previewUrl;
    previewImg.alt = "Preview of selected photo";
    dropContent.classList.add("is-hidden");
    previewWrap.classList.remove("is-hidden");
    fileInput.style.pointerEvents = "none";
    setStatus("");
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files[0]) {
        setPreview(fileInput.files[0]);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearPreview);
  }

  if (dropZone) {
    ["dragenter", "dragover"].forEach(function (eventName) {
      dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropZone.classList.add("is-dragover");
      });
    });

    ["dragleave", "drop"].forEach(function (eventName) {
      dropZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropZone.classList.remove("is-dragover");
      });
    });

    dropZone.addEventListener("drop", function (event) {
      var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) {
        setPreview(file);
      }
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  }

  function uploadLocal(file, name, caption) {
    return readFileAsDataUrl(file).then(function (dataUrl) {
      var photo = {
        id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9),
        url: dataUrl,
        name: name,
        caption: caption,
        uploadedAt: new Date().toISOString(),
      };
      return idbPut(photo).then(function () {
        return {
          pending: false,
          message: "Photo saved locally. Deploy to Vercel with Blob storage to share with everyone.",
        };
      });
    });
  }

  function uploadRemote(file, name, caption) {
    var formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("caption", caption);

    return fetch("/api/upload", {
      method: "POST",
      body: formData,
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) {
          throw new Error(data.error || "Upload failed.");
        }
        return data;
      });
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!selectedFile) {
        setStatus("Please choose a photo to upload.", "error");
        return;
      }

      var name = form.name.value.trim() || "Anonymous";
      var caption = form.caption.value.trim();

      submitBtn.disabled = true;
      setStatus("Uploading your photo…");

      checkApi()
        .then(function (hasApi) {
          if (hasApi) {
            return uploadRemote(selectedFile, name, caption);
          }
          return uploadLocal(selectedFile, name, caption);
        })
        .then(function (data) {
          clearPreview();
          form.caption.value = "";
          setStatus(
            data.message ||
              (apiAvailable
                ? "Photo added to the gallery!"
                : "Photo saved locally. Deploy to Vercel with Blob storage to share with everyone."),
            "success"
          );
          if (!data.pending) {
            return refreshGallery();
          }
        })
        .catch(function (error) {
          setStatus(error.message || "Something went wrong. Please try again.", "error");
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  refreshGallery();
})();
