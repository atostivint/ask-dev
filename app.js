(function () {
  "use strict";

  /* ---------------------------------------------------------------------- */
  /* Crisp — moteur chargé une seule fois, bulle flottante masquée.          */
  /* ---------------------------------------------------------------------- */
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

  /* Confirmation visible après envoi (succès réel : parti ou en file Crisp) */
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

  /* Auto-resize du textarea : une ligne au repos, grandit avec le texte */
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

  /* ---------------------------------------------------------------------- */
  /* Composant Alpine — gestion des vues, saisie et extras.                 */
  /* ---------------------------------------------------------------------- */
  window.portfolio = function () {
    return {
      view: "home",
      input: "",
      suggestions: [
        "Ma facture AWS dérive. Tu regardes ou j'arrête la prod ?",
        "9 certifs et 10 ans de prod : ça se prouve ou c'est du marketing ?",
        "Vous recrutez ? Vous êtes au bon endroit. 👀",
        "kubectl get certifs"
      ],

      init: function () {
        var self = this;
        this.rotatePortrait();
        this.$nextTick(function () {
          autoGrow(document.getElementById("q-input"));
        });
        document.addEventListener("input", function (e) {
          if (e.target && e.target.id === "q-input") autoGrow(e.target);
        }, true);

        /* Extras : routage mots-clés + terminal (compteurs via setView) */
        this._wireExtras();

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
        var self = this;
        var aiImg = document.getElementById("img-ai");
        var realImg = document.getElementById("img-real");
        var hint = document.getElementById("portrait-hint");
        var probe = new Image();

        probe.onload = function () {
          var real = new Image();
          real.onload = function () {
            self.setupSwap(true);
          };
          real.onerror = function () {
            self.setupSwap(false);
          };
          real.src = "alexandre-coucou.jpg";
        };
        probe.onerror = function () {
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

        aiImg.style.display = "block";
        realImg.alt = "Alexandre Tostivint au naturel, en train de faire coucou";

        var showReal = function (show) {
          if (isTouch) {
            frame.classList.toggle("is-flipped", show);
          }
          if (hint) hint.hidden = show;
          if (show && inner && !reduceMotion) self._emitParticles(inner);
        };

        if (hasCoucou) {
          if (isTouch) {
            frame.addEventListener("click", function () {
              showReal(!frame.classList.contains("is-flipped"));
            });
            if (hint) {
              hint.hidden = false;
              hint.textContent = "Touchez-moi.";
            }
          } else {
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
        if (v === "about") this._animateStats();
      },

      /* ---------------------------------------------------------------- */
      /* Extras — 3 ajouts, tous honnêtes (aucune fausse IA) :            */
      /* 1. Routage mots-clés : pastille propose le saut vers la section. */
      /* 2. Compteurs : chiffres montent de 0 au premier affichage.       */
      /* 3. Easter egg terminal : commandes en local, rien à Crisp.       */
      /* ---------------------------------------------------------------- */
      KEYROUTES: [
        { re: /\b(finops|factures?|co[uû]ts?|budget)/i, target: "parcours", label: "FinOps : le cœur du boulot chez DoiT — voir le parcours ?" },
        { re: /\baws\b/i, target: "certs", label: "Les certifs AWS sont ici — voir ?" },
        { re: /\bazure\b/i, target: "certs", label: "Les certifs Azure sont ici — voir ?" },
        { re: /\b(certifs?|certifications?)/i, target: "certs", label: "Les 9 certifs sont ici — voir ?" },
        { re: /\b(cka|kubernetes|k8s)\b/i, target: "objectifs", label: "Kubernetes est dans les objectifs — voir ?" },
        { re: /\b(parcours|exp[eé]rience|carri[eè]re|doit)\b/i, target: "parcours", label: "Le parcours est ici — voir ?" },
        { re: /\b(cv|curriculum)\b/i, target: "cv", label: "Le CV complet est là — ouvrir ?" },
        { re: /\b(recrut|candidat|embauch|mission|postul)/i, target: "contact", label: "Pour un contact, c'est par ici — voir ?" }
      ],

      _wireExtras: function () {
        var self = this;
        var input = document.getElementById("q-input");
        var hint = document.getElementById("route-hint");
        if (!input || !hint) return;
        var current = null;
        var debounce = null;
        var lastClick = 0; /* anti double-clic rapide */

        input.addEventListener("input", function () {
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(function () {
            var found = null;
            var v = input.value;
            if (v.trim().length >= 3) {
              for (var i = 0; i < self.KEYROUTES.length && !found; i++) {
                if (self.KEYROUTES[i].re.test(v)) found = self.KEYROUTES[i];
              }
            }
            current = found;
            if (found) {
              hint.textContent = "\uD83D\uDCA1 " + found.label;
              hint.setAttribute("data-target", found.target);
              hint.classList.add("show");
            } else {
              hint.classList.remove("show");
              hint.removeAttribute("data-target");
            }
          }, 250);
        });

        /* Clic sur la pastille : debounce 400 ms anti double-clic */
        hint.addEventListener("click", function () {
          var now = Date.now();
          if (now - lastClick < 400) return;
          lastClick = now;
          if (!current) return;
          self._route(current.target);
          current = null;
          hint.classList.remove("show");
          hint.removeAttribute("data-target");
          self.input = "";
          input.value = "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });

        /* Raccourcis clavier dans le champ : Escape masque la pastille */
        input.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && hint.classList.contains("show")) {
            hint.classList.remove("show");
            hint.removeAttribute("data-target");
            current = null;
          }
        });
      },

      _route: function (target) {
        var self = this;
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (target === "contact") { this.setView("contact"); return; }
        if (target === "cv") {
          window.open("https://cv.alexandre.tostivint.bzh", "_blank", "noopener");
          return;
        }
        this.setView("about");
        /* Laisse la transition Alpine se poser (~380 ms) puis scroll + flash */
        setTimeout(function () {
          var el = null;
          if (target === "certs") el = document.getElementById("certs");
          else if (target === "objectifs") el = document.getElementById("objectifs");
          else if (target === "parcours") el = document.getElementById("parcours");
          else if (target === "project-finops") el = document.getElementById("project-finops");
          if (!el) return;
          el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
          el.classList.add("flash");
          setTimeout(function () { el.classList.remove("flash"); }, 1800);
        }, 380);
      },

      _animateStats: function () {
        if (this._statsDone) return;
        this._statsDone = true;
        var els = document.querySelectorAll(".count");
        if (!els.length) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          Array.prototype.forEach.call(els, function (el) {
            el.textContent = el.getAttribute("data-target");
          });
          return;
        }
        var t0 = performance.now(), DUR = 1200;
        var tick = function (t) {
          var p = Math.min(1, (t - t0) / DUR);
          var e = 1 - Math.pow(1 - p, 3); /* ease-out-cubic */
          Array.prototype.forEach.call(els, function (el) {
            el.textContent = Math.round(parseInt(el.getAttribute("data-target"), 10) * e);
          });
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },

      _showTerminal: function (cmd) {
        var out = document.querySelector(".terminal-out");
        if (!out) return;
        var c = cmd.toLowerCase();
        var lines;
        if (/^whoami$/.test(c)) {
          lines = [
            "alexandre-tostivint",
            "rôle       : Senior Cloud Architect",
            "uptime     : 10+ ans en IT · 8+ en cloud",
            "base       : Rennes, France · FR natif / EN C1",
            "certifs    : 9 chargées (AWS 6 · Azure 3)",
            "side-quest : FinOps, Well-Architected, agents IA"
          ];
        } else if (/^kubectl get certifs/.test(c)) {
          lines = [
            "NAME                                  AGE",
            "aws-solutions-architect-pro           4y",
            "aws-devops-engineer-pro               4y",
            "aws-security-specialty                3y",
            "aws-networking-specialty              3y",
            "aws-developer-associate               1y",
            "aws-ai-practitioner                   2y",
            "azure-solutions-architect-expert      6y",
            "azure-devops-engineer-expert          6y",
            "azure-security-engineer-associate     6y"
          ];
        } else if (/^kubectl get nodes/.test(c)) {
          lines = [
            "NAME         STATUS   AGE",
            "exaprobe     Ready    3y",
            "cloudreach   Ready    3y",
            "doit         Ready    4y"
          ];
        } else if (/^sudo (make|optimize) (une )?facture/.test(c)) {
          lines = [
            "[sudo] mot de passe : accepté",
            "audit FinOps terminé → plan d'économies livré",
            "300+ clients déjà servis"
          ];
        } else {
          lines = [
            "command not found: " + cmd.split(" ")[0],
            "essais : whoami · kubectl get certifs · kubectl get nodes"
          ];
        }
        lines.push("— easter egg, pas une IA. Pour une vraie réponse : le chat. 🙂");
        out.textContent = "";
        var head = document.createElement("span");
        head.className = "t-prompt";
        head.textContent = "$ " + cmd;
        out.appendChild(head);
        lines.forEach(function (l) {
          var d = document.createElement("span");
          d.className = "t-line";
          d.textContent = l;
          out.appendChild(d);
        });
        out.hidden = false;
      },

      deliver: function (text) {
        if (crispReady) {
          try { $crisp.push(["do", "message:send", ["text", text]]); } catch (e) {}
        } else {
          pendingMessage = text;
        }
        openChat();
      },

      submit: function (ref) {
        var text = (this.input || "").trim();
        if (!text) {
          if (ref && this.$refs[ref]) this.$refs[ref].focus();
          return;
        }
        /* Easter egg terminal : réponse locale, rien n'est envoyé à Crisp */
        if (/^(sudo|kubectl|whoami)\b/i.test(text)) {
          this._showTerminal(text);
          this.input = "";
          var taEgg = document.getElementById("q-input");
          if (taEgg) autoGrow(taEgg);
          return;
        }
        if (crispBlocked) {
          showWarnings();
          if (ref && this.$refs[ref]) this.$refs[ref].focus();
          return;
        }
        this.deliver(text);
        this.input = "";
        var ta = document.getElementById("q-input");
        if (ta) {
          autoGrow(ta);
        }
        showSent("Message transmis. Alexandre répond sous quelques heures.");
      },

      useSuggestion: function (text) {
        var self = this;
        var ta = document.getElementById("q-input");
        if (!ta) return;
        /* Effet machine à écrire, puis envoi réel. Reduced-motion : direct. */
        if (self._typing) return;
        self._typing = true;
        var finish = function () {
          self._typing = false;
          setTimeout(function () { self.submit("qInput"); }, 260);
        };
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          self.input = text;
          ta.dispatchEvent(new Event("input", { bubbles: true }));
          self._typing = false;
          self.submit("qInput");
          return;
        }
        self.input = "";
        var i = 0;
        var step = Math.max(1, Math.round(text.length / 60));
        var iv = setInterval(function () {
          i += step;
          self.input = text.slice(0, i);
          ta.dispatchEvent(new Event("input", { bubbles: true }));
          if (i >= text.length) {
            clearInterval(iv);
            finish();
          }
        }, 24);
      },

      openChatBtn: function () {
        if (crispBlocked) { showWarnings(); return; }
        openChat();
      }
    };
  };
})();
