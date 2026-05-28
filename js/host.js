(function () {
  "use strict";

  var STORAGE_KEY = "ctp-host-checklist";
  var adminCode = sessionStorage.getItem("ctp-admin-code") || "";

  var codeForm = document.getElementById("host-code-form");
  var codeInput = document.getElementById("host-code");
  var dashboard = document.getElementById("host-dashboard");
  var status = document.getElementById("host-status");
  var voteStatus = document.getElementById("host-vote-status");
  var checklist = document.getElementById("host-checklist");

  var defaultItems = [
    "Print QR sign and post at Woodlawn entrance",
    "Set GALLERY_ADMIN_CODE in Vercel (photo moderation)",
    "Test gallery upload on phone over cellular",
    "Test Best Dressed vote on phone",
    "Bookmark Name That Canadian full-screen for TV",
    "Open gallery admin during the party",
  ];

  function setStatus(message, type) {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.className = "form-note" + (type ? " form-note--" + type : "");
  }

  function loadChecks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveChecks(checks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  }

  function renderChecklist() {
    if (!checklist) {
      return;
    }

    var checks = loadChecks();
    checklist.innerHTML = "";

    defaultItems.forEach(function (label, index) {
      var id = "host-check-" + index;
      var item = document.createElement("label");
      item.className = "host-check";
      item.innerHTML =
        '<input type="checkbox" id="' +
        id +
        '"' +
        (checks[id] ? " checked" : "") +
        ">" +
        "<span>" +
        label +
        "</span>";
      checklist.appendChild(item);
    });

    checklist.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("change", function () {
        var next = loadChecks();
        next[input.id] = input.checked;
        saveChecks(next);
      });
    });
  }

  function loadVoteStatus() {
    if (!voteStatus) {
      return;
    }

    fetch("/api/vote")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.closed && data.winner) {
          voteStatus.innerHTML =
            "<strong>Voting closed.</strong> Winner: <strong>" +
            data.winner.nominee +
            "</strong> (" +
            data.winner.count +
            (data.winner.count === 1 ? " vote" : " votes") +
            ")";
          return;
        }

        if (data.closed) {
          voteStatus.textContent = "Voting is closed. No votes were cast.";
          return;
        }

        voteStatus.textContent =
          "Voting open — " +
          (data.totalVotes === 1 ? "1 vote" : data.totalVotes + " votes") +
          " so far. Closes " +
          new Date(data.closesAt).toLocaleString("en-US", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
          }) +
          ".";
      })
      .catch(function () {
        voteStatus.textContent = "Vote status unavailable.";
      });
  }

  if (codeForm && codeInput) {
    if (adminCode) {
      codeInput.value = adminCode;
      if (dashboard) {
        dashboard.classList.remove("is-hidden");
      }
    }

    codeForm.addEventListener("submit", function (event) {
      event.preventDefault();
      adminCode = codeInput.value.trim();
      if (!adminCode) {
        setStatus("Enter the host admin code.", "error");
        return;
      }

      fetch("/api/poll?admin=1&code=" + encodeURIComponent(adminCode))
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) {
              throw new Error(data.error || "Invalid admin code.");
            }
            return data;
          });
        })
        .then(function () {
          sessionStorage.setItem("ctp-admin-code", adminCode);
          if (dashboard) {
            dashboard.classList.remove("is-hidden");
          }
          setStatus("Host dashboard unlocked.", "success");
          loadVoteStatus();
        })
        .catch(function (error) {
          setStatus(error.message, "error");
        });
    });
  }

  renderChecklist();
  loadVoteStatus();
  setInterval(loadVoteStatus, 30000);
})();
