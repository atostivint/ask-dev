(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     Crisp — moteur chargé une seule fois, bulle flottante masquée.
     On garde la logique d'origine (détection de blocage, file d'attente).
  ---------------------------------------------------------------------- */
  window.CRISP_WEBSITE_ID = "-K4rlGkym4Yw7OXHl99n";

  var crispReady = false;
  var crispBlocked = false;
  var pendingMessage = null;

  function showWarnings() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".q-warning"),
      function (el) { el.classList.add("show"); }
    );
  }
  function hideWarnings() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".q-warning"),
      function (el) { el.classList.remove("show"); }
    );
  }

  window.CRISP_READY_TRIGGER = function () {
    crispReady = true;
    crispBlocked = false;
    try { $crisp.push(["do", "launcher:hide"]); } catch (e) {}
    hideWarnings();
    if (pendingMessage !== null) {
      try { $crisp.push(["do", "message:send", ["text", pendingMessage]]); } catch (e) {}
      pendingMessage = null;
    }
  };

  function openChat() {
    try { $crisp.push(["do", "chat:open"]); } catch (e) {}
  }

  /* Chargement du moteur Crisp */
  (function () {
    var d = document, s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    d.getElementsByTagName("head")[0].appendChild(s);
  })();

  /* Masquer la bulle flottante (on utilise l'API, pas la bulle) */
  var st = document.createElement("style");
  st.textContent = "";
  document.addEventListener("DOMContentLoaded", function () {
    document.head.appendChild(st);
  });

  /* ----------------------------------------------------------------------
     Composant Alpine — gestion des vues et de la saisie.
  ---------------------------------------------------------------------- */
  window.portfolio = function () {
    return {
      view: "home",
      input: "",
      suggestions: [
        "Comment réduire ma facture AWS sans casser la prod ?",
        "Quelles certifs viser pour devenir architecte cloud ?",
        "Vous êtes ouvert aux opportunités ? 👀"
      ],

      init: function () {
        var self = this;

        /* Rotation de la photo (webp + jpg fallback) */
        this.rotatePortrait();

        /* Détection du blocage (adblocker) après 4 s */
        setTimeout(function () {
          var loaded = crispReady || document.querySelector(".crisp-client") !== null;
          if (!loaded) {
            crispBlocked = true;
            showWarnings();
          }
        }, 4000);
      },

      rotatePortrait: function () {
        var variants = ["alexandre-portrait-a", "alexandre-portrait-b"];
        var pick = variants[Math.floor(Math.random() * variants.length)];
        var source = document.getElementById("hero-source");
        var img = document.getElementById("hero-img");
        if (source) source.srcset = pick + ".webp";
        if (img) {
          img.src = pick + ".jpg";
          img.srcset = pick + ".webp";
        }
      },

      setView: function (v) {
        this.view = v;
      },

      deliver: function (text) {
        if (crispReady) {
          try { $crisp.push(["do", "message:send", ["text", text]]); } catch (e) {}
        } else {
          pendingMessage = text; /* envoyé dès que Crisp est prêt */
        }
        openChat();
      },

      submit: function (ref) {
        var text = (this.input || "").trim();
        if (!text) {
          if (ref && this.$refs[ref]) this.$refs[ref].focus();
          return;
        }
        if (crispBlocked) {
          showWarnings();
          if (ref && this.$refs[ref]) this.$refs[ref].focus();
          return;
        }
        this.deliver(text);
        this.input = "";
      },

      useSuggestion: function (text) {
        this.input = text;
        this.submit("qInput");
      },

      openChatBtn: function () {
        if (crispBlocked) { showWarnings(); return; }
        openChat();
      }
    };
  };
})();
