(function () {
  "use strict";

  var defaultCount = window.CTP && window.CTP.VOTE_TAG_COUNT ? window.CTP.VOTE_TAG_COUNT : 30;
  var maxNumber = window.CTP && window.CTP.VOTE_MAX_NUMBER ? window.CTP.VOTE_MAX_NUMBER : 99;
  var grid = document.getElementById("numbers-grid");
  var countInput = document.getElementById("numbers-count");
  var regenerateBtn = document.getElementById("numbers-regenerate");

  function getCount() {
    var parsed = parseInt(countInput && countInput.value, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return defaultCount;
    }
    return Math.min(parsed, maxNumber);
  }

  function renderTags() {
    if (!grid) {
      return;
    }

    var count = getCount();
    if (countInput) {
      countInput.value = String(count);
    }

    grid.innerHTML = "";
    for (var i = 1; i <= count; i += 1) {
      var tag = document.createElement("div");
      tag.className = "number-tag";
      tag.innerHTML =
        '<span class="number-tag__label">Contestant</span>' +
        '<span class="number-tag__value">' +
        i +
        "</span>" +
        '<span class="number-tag__hint">Vote for #</span>';
      grid.appendChild(tag);
    }
  }

  if (regenerateBtn) {
    regenerateBtn.addEventListener("click", renderTags);
  }

  if (countInput) {
    countInput.max = String(maxNumber);
    countInput.addEventListener("change", renderTags);
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get("count") && countInput) {
    countInput.value = params.get("count");
  }

  renderTags();
})();
