(function () {
  "use strict";

  const form = document.getElementById("poll-form");
  const status = document.getElementById("poll-status");
  const submitBtn = document.getElementById("poll-submit");

  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const selectedDates = Array.from(form.querySelectorAll('input[name="dates"]:checked')).map(function (input) {
        return input.value;
      });
      const feedback = form.feedback.value.trim();

      if (selectedDates.length === 0) {
        status.textContent = "Please pick at least one date (or an other option).";
        status.className = "form-note form-note--error";
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
      }
      status.textContent = "Saving your response…";
      status.className = "form-note";

      fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          dates: selectedDates,
          feedback: feedback,
        }),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) {
              throw new Error(data.error || "Submission failed.");
            }
            return data;
          });
        })
        .then(function (data) {
          status.textContent = data.message || "Thanks — your poll response was saved!";
          status.className = "form-note form-note--success";
          form.reset();
        })
        .catch(function (error) {
          status.textContent = error.message || "Something went wrong. Please try again.";
          status.className = "form-note form-note--error";
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
          }
        });
    });
  }
})();
