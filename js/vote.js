(function () {
  "use strict";

  var VOTE_KEY = "ctp-best-dressed-vote";
  var closeTime = window.CTP ? window.CTP.VOTE_CLOSE_TIME : "2026-05-30T22:00:00-07:00";

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

  var form = document.getElementById("vote-form");
  var status = document.getElementById("vote-status");
  var resultsEl = document.getElementById("vote-results");
  var resultsList = document.getElementById("vote-results-list");
  var resultsTotal = document.getElementById("vote-results-total");
  var submitBtn = document.getElementById("vote-submit");
  var winnerEl = document.getElementById("vote-winner");
  var winnerName = document.getElementById("vote-winner-name");
  var winnerCount = document.getElementById("vote-winner-count");
  var voteOpenNote = document.getElementById("vote-open-note");

  function setStatus(message, type) {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.className = "form-note" + (type ? " form-note--" + type : "");
  }

  function formatCloseTime() {
    return new Date(closeTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function applyClosedState(data) {
    if (!data.closed) {
      if (voteOpenNote) {
        voteOpenNote.textContent = "Voting closes " + formatCloseTime() + ".";
        voteOpenNote.classList.remove("is-hidden");
      }
      return;
    }

    if (voteOpenNote) {
      voteOpenNote.classList.add("is-hidden");
    }

    if (form) {
      form.classList.add("is-closed");
    }

    if (submitBtn) {
      submitBtn.disabled = true;
    }

    if (winnerEl && data.winner) {
      winnerName.textContent = data.winner.nominee;
      winnerCount.textContent =
        data.winner.count + (data.winner.count === 1 ? " vote" : " votes");
      winnerEl.classList.remove("is-hidden");
    }

    setStatus("Voting is closed for the night.", "success");
  }

  function renderResults(data) {
    if (!resultsEl || !resultsList || !resultsTotal) {
      return;
    }

    applyClosedState(data);
    resultsList.innerHTML = "";
    var results = data.results || [];

    if (results.length === 0) {
      resultsTotal.textContent = data.closed
        ? "No votes were cast."
        : "No votes yet — cast the first one!";
      resultsEl.classList.remove("is-hidden");
      return;
    }

    resultsTotal.textContent = data.closed
      ? "Final results — " +
        (data.totalVotes === 1 ? "1 vote" : data.totalVotes + " votes")
      : data.totalVotes === 1
        ? "1 vote counted"
        : data.totalVotes + " votes counted";

    results.forEach(function (item, index) {
      var row = document.createElement("li");
      row.className = "vote-result" + (data.closed && index === 0 ? " vote-result--winner" : "");
      row.innerHTML =
        '<span class="vote-result__rank">' +
        (index + 1) +
        '</span><span class="vote-result__name">' +
        item.nominee +
        '</span><span class="vote-result__count">' +
        item.count +
        (item.count === 1 ? " vote" : " votes") +
        "</span>";
      resultsList.appendChild(row);
    });

    resultsEl.classList.remove("is-hidden");
  }

  function loadResults() {
    return fetch("/api/vote")
      .then(function (response) {
        return response.json();
      })
      .then(renderResults)
      .catch(function () {
        if (resultsTotal) {
          resultsTotal.textContent = "Live results unavailable offline.";
        }
      });
  }

  if (localStorage.getItem(VOTE_KEY) && form) {
    form.classList.add("is-voted");
    if (!form.classList.contains("is-closed")) {
      setStatus("You already voted — thanks!", "success");
    }
    if (submitBtn && !form.classList.contains("is-closed")) {
      submitBtn.disabled = true;
    }
  }

  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (form.classList.contains("is-closed")) {
        setStatus("Voting is closed for the night.", "error");
        return;
      }

      if (localStorage.getItem(VOTE_KEY)) {
        setStatus("You already voted on this device.", "error");
        return;
      }

      var voter = form.voter.value.trim();
      var nominee = form.nominee.value.trim();

      if (!voter || !nominee) {
        setStatus("Please enter your name and who you're voting for.", "error");
        return;
      }

      submitBtn.disabled = true;
      setStatus("Recording your vote…");

      fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter: voter, nominee: nominee }),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) {
              throw new Error(data.error || "Vote failed.");
            }
            return data;
          });
        })
        .then(function (data) {
          localStorage.setItem(VOTE_KEY, new Date().toISOString());
          form.classList.add("is-voted");
          setStatus(data.message || "Vote recorded — thanks!", "success");
          return loadResults();
        })
        .catch(function (error) {
          setStatus(error.message || "Something went wrong. Please try again.", "error");
          if (!form.classList.contains("is-closed")) {
            submitBtn.disabled = false;
          }
        });
    });
  }

  loadResults();
  setInterval(loadResults, 15000);
})();
