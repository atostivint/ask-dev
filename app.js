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

  /* Confirmation visible après envoi (succes reel : parti ou en file Crisp) */
  function showSent(text) {
    var box = document.querySelector(".sent-confirm");
    if (!box) return;
    box.textContent = text;
    box.classList.add("show");
    clearTimeout(showSent._t);
    showSent._t = setTimeout(function () {
      box.classList.remove("show");
    }, 8000);
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

  /* Auto-resize du textarea : une ligne au repos, grandit avec le texte
     (comme ChatGPT). Le bouton reste aligne avec la derniere ligne. */
  function autoGrow(ta) {
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
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
        "Ma facture AWS dérive. Tu regardes ou j'arrête la prod ?",
        "9 certifs et 10 ans de prod : ça se prouve ou c'est du marketing ?",
        "Vous recrutez ? Vous êtes au bon endroit. 👀"
      ],

      init: function () {
        var self = this;

        /* Rotation de la photo (webp + jpg fallback) */
        this.rotatePortrait();

        /* Taille au repos du textarea (une ligne) */
        this.$nextTick(function () {
          autoGrow(document.getElementById("q-input"));
        });
        document.addEventListener("input", function (e) {
          if (e.target && e.target.id === "q-input") autoGrow(e.target);
        }, true);

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
        /* Swap avatar IA ↔ photo réelle.
           Si avatar-ai.png ET alexandre-coucou.jpg existent : l'avatar IA
           s'affiche par défaut, la photo coucou au hover (desktop) ou au
           tap (mobile). Sinon : rotation A/B de l'ancien comportement. */
        var self = this;
        var aiImg = document.getElementById("img-ai");
        var realImg = document.getElementById("img-real");
        var hint = document.getElementById("portrait-hint");
        var probe = new Image();

        probe.onload = function () {
          /* avatar-ai.png existe : activer le mode swap */
          var real = new Image();
          real.onload = function () {
            self.setupSwap(true);
          };
          real.onerror = function () {
            /* avatar IA présent mais pas de photo coucou : avatar seul */
            self.setupSwap(false);
          };
          real.src = "alexandre-coucou.jpg";
        };
        probe.onerror = function () {
          /* pas d'avatar IA : fallback rotation A/B */
          var variants = ["alexandre-portrait-a", "alexandre-portrait-b"];
          var pick = variants[Math.floor(Math.random() * variants.length)];
          realImg.src = pick + ".jpg";
          if (hint) hint.hidden = true;
        };
        probe.src = "avatar-ai.png";
      },

      setupSwap: function (hasCoucou) {
        var self = this;
        var aiImg = document.getElementById("img-ai");
        var realImg = document.getElementById("img-real");
        var hint = document.getElementById("portrait-hint");
        var frame = document.getElementById("portrait-frame");
        var inner = frame ? frame.querySelector(".portrait-inner") : null;
        var isTouch = window.matchMedia("(hover: none)").matches;
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        /* l'avatar IA devient la face visible */
        aiImg.style.display = "block";
        realImg.alt = "Alexandre Tostivint au naturel, en train de faire coucou";

        var showReal = function (show) {
          /* Desktop : les states hover CSS font le travail ; JS gère les particules + le hint */
          if (isTouch) {
            frame.classList.toggle("is-flipped", show);
          }
          if (hint) hint.hidden = show;
          /* Particules de dématérialisation au moment où l'avatar s'efface */
          if (show && inner && !reduceMotion) self._emitParticles(inner);
        };

        if (hasCoucou) {
          if (isTouch) {
            /* Mobile : tap pour révéler, re-tap pour re-masquer */
            frame.addEventListener("click", function () {
              showReal(!frame.classList.contains("is-flipped"));
            });
            if (hint) {
              hint.hidden = false;
              hint.textContent = "Touchez-moi.";
            }
          } else {
            /* Desktop : hover CSS + particules JS */
            frame.classList.add("has-swap");
            frame.addEventListener("mouseenter", function () { showReal(true); });
            frame.addEventListener("mouseleave", function () { showReal(false); });
            if (hint) {
              hint.hidden = false;
              hint.textContent = "Survolez-moi.";
            }
          }
        }
      },

      _emitParticles: function (inner) {
        /* 12 particules s'échappent du bord droit du portrait :
           écho de la dissolution de l'avatar IA */
        var rect = inner.getBoundingClientRect();
        for (var i = 0; i < 12; i++) {
          (function (idx) {
            var p = document.createElement("span");
            p.className = "swap-particle";
            var y = rect.height * (0.2 + Math.random() * 0.6);
            var ang = (Math.random() - 0.5) * 1.6;
            var dist = 30 + Math.random() * 50;
            p.style.top = y + "px";
            p.style.right = (idx % 3) * 6 + "px";
            p.style.setProperty("--px", Math.cos(ang) * dist + "px");
            p.style.setProperty("--py", Math.sin(ang) * dist - 20 + "px");
            inner.appendChild(p);
            setTimeout(function () { p.remove(); }, 750);
          })(i);
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
        /* Reset de la hauteur après vidage (autoGrow lit scrollHeight) */
        var ta = document.getElementById("q-input");
        if (ta) {
          autoGrow(ta);
        }
        showSent("Message transmis. Alexandre répond sous quelques heures.");
      },

      useSuggestion: function (text) {
        this.input = text;
        var ta = document.getElementById("q-input");
        if (ta) autoGrow(ta);
        this.submit("qInput");
      },

      openChatBtn: function () {
        if (crispBlocked) { showWarnings(); return; }
        openChat();
      }
    };
  };
})();
