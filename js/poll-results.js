(function () {
  "use strict";

  var adminCode = sessionStorage.getItem("ctp-admin-code") || "";

  var codeForm = document.getElementById("poll-results-code-form");
  var codeInput = document.getElementById("poll-results-code");
  var panel = document.getElementById("poll-results-panel");
  var status = document.getElementById("poll-results-status");
  var datesEl = document.getElementById("poll-results-dates");
  var entriesEl = document.getElementById("poll-results-entries");
  var summaryEl = document.getElementById("poll-results-summary");

  function setStatus(message, type) {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.className = "form-note" + (type ? " form-note--" + type : "");
  }

  function renderResults(data) {
    if (summaryEl) {
      summaryEl.textContent =
        data.totalResponses === 1
          ? "1 response received"
          : data.totalResponses + " responses received";
    }

    if (datesEl) {
      datesEl.innerHTML = "";
      var ranked = data.rankedDates || [];

      if (ranked.length === 0) {
        datesEl.innerHTML = '<p class="poll-results-empty">No date votes yet.</p>';
      } else {
        ranked.forEach(function (item, index) {
          var row = document.createElement("li");
          row.className = "poll-results-date";
          row.innerHTML =
            '<span class="poll-results-date__rank">' +
            (index + 1) +
            '</span><span class="poll-results-date__label">' +
            item.date +
            '</span><span class="poll-results-date__count">' +
            item.count +
            (item.count === 1 ? " vote" : " votes") +
            "</span>";
          datesEl.appendChild(row);
        });
      }
    }

    if (entriesEl) {
      entriesEl.innerHTML = "";
      var entries = data.entries || [];

      if (entries.length === 0) {
        entriesEl.innerHTML = '<p class="poll-results-empty">No feedback yet.</p>';
        return;
      }

      entries.forEach(function (entry) {
        var card = document.createElement("article");
        card.className = "poll-results-entry";
        var dates = entry.dates.join(", ");
        card.innerHTML =
          "<h3>" +
          entry.name +
          "</h3>" +
          (entry.email ? "<p class=\"poll-results-entry__email\">" + entry.email + "</p>" : "") +
          "<p><strong>Dates:</strong> " +
          dates +
          "</p>" +
          (entry.feedback
            ? "<p><strong>Feedback:</strong> " + entry.feedback + "</p>"
            : "<p><em>No written feedback.</em></p>");
        entriesEl.appendChild(card);
      });
    }
  }

  function loadResults() {
    if (!adminCode) {
      return;
    }

    return fetch("/api/poll?admin=1&code=" + encodeURIComponent(adminCode), {
      headers: { "x-admin-code": adminCode },
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.error || "Could not load poll results.");
          }
          return data;
        });
      })
      .then(renderResults)
      .catch(function (error) {
        setStatus(error.message, "error");
      });
  }

  if (codeForm && codeInput) {
    if (adminCode) {
      codeInput.value = adminCode;
      if (panel) {
        panel.classList.remove("is-hidden");
      }
      loadResults();
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
      setStatus("Loading results…");
      loadResults().then(function () {
        setStatus("", "");
      });
    });
  }
})();
