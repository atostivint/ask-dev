(function () {
  "use strict";
  var english = document.documentElement.lang === "en";
  var form = document.getElementById("preview-form");
  var field = document.getElementById("preview-message");
  var status = document.getElementById("preview-status");
  // This prototype never loads a messaging SDK or submits a network request.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.textContent = english
      ? "Preview only: no message was transmitted. Your draft is kept."
      : "Aperçu uniquement : aucun message n’a été transmis. Votre brouillon est conservé.";
  });
  field.disabled = false;
  form.querySelector("button[type='submit']").disabled = false;
  field.addEventListener("input", function () { status.textContent = ""; });
  document.querySelectorAll("[data-draft]").forEach(function (button) {
    button.disabled = false;
    button.addEventListener("click", function () {
      if (!field.value.trim()) {
        field.value = button.getAttribute("data-draft");
        status.textContent = "";
      } else {
        status.textContent = english ? "Your existing draft is kept." : "Votre brouillon existant est conservé.";
      }
      field.focus();
    });
  });
  var control = document.getElementById("network-control");
  if (!window.portfolioNetwork) { control.hidden = true; return; }
  control.hidden = false;
  var paused = false;
  control.addEventListener("click", function () {
    paused = !paused;
    window.portfolioNetwork.setPaused(paused);
    control.setAttribute("aria-pressed", String(paused));
    control.textContent = english
      ? (paused ? "Resume animations" : "Stop animations")
      : (paused ? "Reprendre les animations" : "Arrêter les animations");
  });
})();
