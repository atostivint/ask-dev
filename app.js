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
  /* i18n : les libellés UI vivent ici. La page /en/ utilise la branche "en". */
  window.ASK_I18N = {
    fr: {
      _base: "",
      suggestions: [
        "Ma facture AWS dérive. Tu regardes ou j'arrête la prod ?",
        "6 certifs actives et 10 ans de prod : ça se prouve ou c'est du marketing ?",
        "Vous recrutez ? Vous êtes au bon endroit. 👀",
        "kubectl get certifs"
      ],
      hintHover: "Survolez-moi.",
      hintTouch: "Touchez-moi.",
      sentToast: "Message transmis. Alexandre répond sous quelques heures.",
      eggTried: "essais : whoami · kubectl get certifs · kubectl get nodes",
      eggFooter: "— easter egg, pas une IA. Pour une vraie réponse : le chat. 🙂",
      whoami: [
        "alexandre-tostivint",
        "rôle       : Senior Cloud Architect",
        "uptime     : 10+ ans en IT · 8+ en cloud",
        "base       : Rennes, France · FR natif / EN C1",
        "certifs    : 6 actives (AWS 4 · Azure 2)",
        "side-quest : FinOps, Well-Architected, agents IA"
      ],
      facture: [
        "[sudo] mot de passe : accepté",
        "audit FinOps terminé → plan d'économies livré",
        "300+ clients déjà servis"
      ],
      keyroutes: [
        { re: /\b(finops|factures?|co[uû]ts?|budget)/i, target: "parcours", label: "FinOps : le cœur du boulot chez DoiT — voir le parcours ?" },
        { re: /\baws\b/i, target: "certs", label: "Les certifs AWS sont ici — voir ?" },
        { re: /\bazure\b/i, target: "certs", label: "Les certifs Azure sont ici — voir ?" },
        { re: /\b(certifs?|certifications?)\b/i, target: "certs", label: "Les 6 certifs actives sont ici — voir ?" },
        { re: /\b(parcours|exp[eé]rience|carri[eè]re|doit)\b/i, target: "parcours", label: "Le parcours est ici — voir ?" },
        { re: /\b(cv|curriculum)\b/i, target: "cv", label: "Le CV complet est là — ouvrir ?" },
        { re: /\b(recrut|candidat|embauch|mission|postul)/i, target: "contact", label: "Pour un contact, c'est par ici — voir ?" }
      ]
    },
    en: {
      _base: "../",
      suggestions: [
        "My AWS bill is drifting. Want to look, or should I shut prod down?",
        "6 active certifications and 10+ years: can you prove that, or is it marketing?",
        "You're hiring? You're in the right place. 👀",
        "kubectl get certifs"
      ],
      hintHover: "Hover me.",
      hintTouch: "Tap me.",
      sentToast: "Message sent. Alexandre replies within a few hours.",
      eggTried: "try: whoami · kubectl get certifs · kubectl get nodes",
      eggFooter: "- easter egg, not an AI. For a real answer: the chat. 🙂",
      whoami: [
        "alexandre-tostivint",
        "role       : Senior Cloud Architect",
        "uptime     : 10+ years in IT · 8+ in cloud",
        "base       : Rennes, France · FR native / EN C1",
        "certifs    : 6 active (AWS 4 · Azure 2)",
        "side-quest : FinOps, Well-Architected, AI agents"
      ],
      facture: [
        "[sudo] password: accepted",
        "FinOps audit done → savings plan delivered",
        "300+ customers served so far"
      ],
      keyroutes: [
        { re: /\b(finops|invoices?|bills?|costs?|budget)/i, target: "parcours", label: "That's FinOps, the core of my DoiT work — see my career?" },
        { re: /\baws\b/i, target: "certs", label: "AWS certifications live here — want to see?" },
        { re: /\bazure\b/i, target: "certs", label: "Azure certifications live here — want to see?" },
        { re: /\b(certifs?|certs|certifications?|certificates?)\b/i, target: "certs", label: "The 6 active certifications are here — see?" },
        { re: /\b(career|journey|background|doit)\b/i, target: "parcours", label: "My career path is here — see?" },
        { re: /\b(cv|resume|curriculum)\b/i, target: "cv", label: "The full resume opens here — see?" },
        { re: /\b(recruit|hiring|candidates?|jobs?|apply|position)/i, target: "contact", label: "To get in touch, it's this way — see?" }
      ]
    }
  };

  window.portfolio = function () {
    var T = window.ASK_I18N[(document.documentElement.getAttribute("lang") || "fr").slice(0, 2).toLowerCase()] || window.ASK_I18N.fr;
    var BASE = T._base;
    return {
      view: "home",
      input: "",
      suggestions: T.suggestions,

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
          real.src = BASE + "alexandre-coucou-aligne.jpg";
        };
        probe.onerror = function () {
          /* Pas d'avatar IA dispo : la vraie photo s'affiche, pas de faux IA. */
          var variants = ["alexandre-portrait-a", "alexandre-portrait-b"];
          var pick = variants[Math.floor(Math.random() * variants.length)];
          realImg.src = BASE + pick + ".jpg";
          aiImg.style.display = "none";
          realImg.style.display = "block";
          realImg.classList.add("is-visible");
          if (hint) hint.classList.add("is-hidden");
        };
        probe.src = BASE + "avatar-ai.png";
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
        realImg.alt = T.hintTouch === "Tap me." ? "Alexandre Tostivint, waving hello" : "Alexandre Tostivint au naturel, en train de faire coucou";

        var showReal = function (show) {
          if (isTouch) {
            frame.classList.toggle("is-flipped", show);
          }
          /* Le hint fond sans disparaître : place réservée, zéro saut de page */
          if (hint) hint.classList.toggle("is-hidden", show);
          if (show && inner && !reduceMotion) self._emitParticles(inner);
        };

        if (hasCoucou) {
          if (isTouch) {
            frame.addEventListener("click", function () {
              showReal(!frame.classList.contains("is-flipped"));
            });
            if (hint) {
              hint.classList.remove("is-hidden");
              hint.textContent = T.hintTouch;
            }
          } else {
            frame.classList.add("has-swap");
            frame.addEventListener("mouseenter", function () { showReal(true); });
            frame.addEventListener("mouseleave", function () { showReal(false); });
            if (hint) {
              hint.classList.remove("is-hidden");
              hint.textContent = T.hintHover;
            }
          }
        }
      },

      _emitParticles: function (inner) {
        var rect = inner.getBoundingClientRect();
        for (var i = 0; i < 5; i++) {
          (function (idx) {
            var p = document.createElement("span");
            p.className = "swap-particle";
            var y = rect.height * (0.2 + Math.random() * 0.6);
            var ang = (Math.random() - 0.5) * 1.6;
            var dist = 20 + Math.random() * 25;
            p.style.top = y + "px";
            p.style.right = (idx % 3) * 6 + "px";
            p.style.setProperty("--px", Math.cos(ang) * dist + "px");
            p.style.setProperty("--py", Math.sin(ang) * dist - 14 + "px");
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
      KEYROUTES: T.keyroutes,

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
          else if (target === "parcours") el = document.getElementById("parcours");
          else if (target === "project-finops") el = document.getElementById("project-finops");
          else if (target === "projects") el = document.getElementById("projects");
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
          lines = T.whoami;
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
          lines = T.facture;
        } else {
          lines = [
            "command not found: " + cmd.split(" ")[0],
            T.eggTried
          ];
        }
        lines.push(T.eggFooter);
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
        showSent(T.sentToast);
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
