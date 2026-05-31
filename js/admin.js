(function () {
  "use strict";

  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
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

  var codeForm = document.getElementById("admin-code-form");
  var codeInput = document.getElementById("admin-code");
  var panel = document.getElementById("admin-panel");
  var status = document.getElementById("admin-status");
  var listEl = document.getElementById("admin-pending-list");
  var adminCode = sessionStorage.getItem("ctp-admin-code") || "";

  function setStatus(message, type) {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.className = "form-note" + (type ? " form-note--" + type : "");
  }

  function renderPending(pending) {
    if (!listEl) {
      return;
    }

    listEl.innerHTML = "";

    if (!pending.length) {
      listEl.innerHTML = '<p class="admin-empty">No photos waiting for review.</p>';
      return;
    }

    pending.forEach(function (photo) {
      var card = document.createElement("article");
      card.className = "admin-card";
      var isVideo =
        photo.mediaType === "video" ||
        (photo.contentType && photo.contentType.indexOf("video/") === 0);
      var media = isVideo
        ? '<video src="' +
          photo.url +
          '" controls muted playsinline preload="metadata"></video>'
        : '<img src="' +
          photo.url +
          '" alt="Pending upload by ' +
          photo.name +
          '">';
      card.innerHTML =
        media +
        '<div class="admin-card__body">' +
        "<h3>" +
        (isVideo ? "Video · " : "") +
        photo.name +
        "</h3>" +
        (photo.caption ? "<p>" + photo.caption + "</p>" : "") +
        '<div class="admin-card__actions">' +
        '<button type="button" class="btn btn--primary" data-action="approve" data-id="' +
        photo.id +
        '">Approve</button>' +
        '<button type="button" class="btn btn--secondary" data-action="reject" data-id="' +
        photo.id +
        '">Reject</button>' +
        "</div></div>";
      listEl.appendChild(card);
    });
  }

  function loadPending() {
    if (!adminCode) {
      return;
    }

    return fetch("/api/gallery-admin?code=" + encodeURIComponent(adminCode))
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.error || "Could not load pending photos.");
          }
          return data.pending || [];
        });
      })
      .then(renderPending)
      .catch(function (error) {
        setStatus(error.message, "error");
      });
  }

  function reviewPhoto(id, action) {
    return fetch("/api/gallery-admin?code=" + encodeURIComponent(adminCode), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-code": adminCode },
      body: JSON.stringify({ id: id, action: action }),
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) {
          throw new Error(data.error || "Action failed.");
        }
        return data;
      });
    });
  }

  if (codeForm && codeInput) {
    if (adminCode) {
      codeInput.value = adminCode;
      if (panel) {
        panel.classList.remove("is-hidden");
      }
      loadPending();
    }

    codeForm.addEventListener("submit", function (event) {
      event.preventDefault();
      adminCode = codeInput.value.trim();
      if (!adminCode) {
        setStatus("Enter the admin code.", "error");
        return;
      }

      sessionStorage.setItem("ctp-admin-code", adminCode);
      if (panel) {
        panel.classList.remove("is-hidden");
      }
      setStatus("Loading pending photos…");
      loadPending().then(function () {
        setStatus("", "");
      });
    });
  }

  if (listEl) {
    listEl.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }

      var id = button.getAttribute("data-id");
      var action = button.getAttribute("data-action");
      button.disabled = true;

      reviewPhoto(id, action)
        .then(function () {
          setStatus(action === "approve" ? "Photo approved." : "Photo rejected.", "success");
          return loadPending();
        })
        .catch(function (error) {
          setStatus(error.message, "error");
          button.disabled = false;
        });
    });
  }
})();
