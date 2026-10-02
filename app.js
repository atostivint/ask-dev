(function () {
  "use strict";
  var TEXT = {
    fr: {
      empty: "Écrivez un message avant de l'envoyer.",
      loading: "Chargement du chat… Votre brouillon est conservé.",
      ready: "Chat disponible. Vous pouvez envoyer votre message.",
      sending: "Envoi en cours…",
      sent: "Crisp confirme l'envoi de votre message. Vous pouvez poursuivre dans le chat.",
      unavailable: "Le chat ne s'est pas chargé. Votre message n'a pas été envoyé. Utilisez l'email ou LinkedIn ci-dessous.",
      uncertain: "L'envoi n'a pas été confirmé. Votre brouillon est conservé. Vérifiez le chat avant de réessayer, ou utilisez l'email ou LinkedIn.",
      failed: "L'envoi n'a pas abouti. Votre brouillon est conservé. Utilisez l'email ou LinkedIn.",
      chatFailed: "Le chat n'a pas pu s'ouvrir. Utilisez l'email ou LinkedIn ci-dessous.",
      saved: "Votre brouillon existant est conservé.",
      suggestions: ["Je souhaite discuter d'un poste.", "Je souhaite discuter d'un projet cloud.", "J'ai une question sur l'architecture ou les coûts cloud."]
    },
    en: {
      empty: "Write a message before sending it.",
      loading: "Loading chat… Your draft is kept.",
      ready: "Chat is available. You can send your message.",
      sending: "Sending…",
      sent: "Crisp confirms your message was sent. You can continue in chat.",
      unavailable: "Chat did not load. Your message was not sent. Use email or LinkedIn below.",
      uncertain: "Sending has not been confirmed. Your draft is kept. Check the chat before trying again, or use email or LinkedIn.",
      failed: "Sending failed. Your draft is kept. Use email or LinkedIn.",
      chatFailed: "Chat could not open. Use email or LinkedIn below.",
      saved: "Your existing draft is kept.",
      suggestions: ["I'd like to discuss a role.", "I'd like to discuss a cloud project.", "I have a question about cloud architecture or costs."]
    }
  };
  var loadPromise = null;
  var sdkReady = false;
  var sendListener = null;

  // No third-party requests before an explicit chat action.
  function loadChat(language) {
    if (sdkReady) return Promise.resolve();
    if (loadPromise) return loadPromise;
    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = "-K4rlGkym4Yw7OXHl99n";
    window.CRISP_RUNTIME_CONFIG = { locale: language };
    loadPromise = new Promise(function (resolve, reject) {
      var settled = false;
      var timer = setTimeout(function () {
        settled = true;
        reject(new Error("chat-timeout"));
      }, 4000);
      window.CRISP_READY_TRIGGER = function () {
        sdkReady = true;
        clearTimeout(timer);
        window.$crisp.push(["do", "chat:hide"]);
        window.$crisp.push(["config", "availability:tooltip", [false]]);
        window.$crisp.push(["config", "color:mode", ["dark"]]);
        window.$crisp.push(["on", "chat:closed", function () {
          window.$crisp.push(["do", "chat:hide"]);
        }]);
        window.$crisp.push(["on", "message:sent", function (message) {
          if (sendListener) sendListener(message);
        }]);
        // Late SDK readiness never sends a previously timed-out draft.
        if (!settled) { settled = true; resolve(); }
      };
      window.$crisp.push(["do", "chat:hide"]);
      window.$crisp.push(["config", "availability:tooltip", [false]]);
      var script = document.createElement("script");
      script.src = "https://client.crisp.chat/l.js";
      script.async = true;
      script.onerror = function () {
        clearTimeout(timer);
        if (!settled) { settled = true; reject(new Error("chat-load-failed")); }
      };
      document.head.appendChild(script);
    });
    return loadPromise;
  }

  function revealChat() {
    window.$crisp.push(["do", "chat:show"]);
    window.$crisp.push(["do", "chat:open"]);
  }

  window.portfolio = function () {
    var language = document.documentElement.lang === "en" ? "en" : "fr";
    var t = TEXT[language];
    var activeSend = null;
    var sendTimer = null;
    var routeListener = null;
    return {
      view: "home", routeHash: "#home", intent: "hiring", input: "", status: "idle", statusText: "", chatLoading: false,
      animationsPaused: false, portraitPhoto: false,
      localResult: [], localResultCommand: "", localResultHref: "#about", localResultLink: "",
      suggestions: t.suggestions,
      get busy() { return this.chatLoading || this.status === "sending"; },
      get localCommand() { return this.input === "whoami" || this.input === "kubectl get certifs" ? this.input : ""; },
      toggleAnimations: function () {
        this.animationsPaused = !this.animationsPaused;
        if (window.portfolioNetwork) window.portfolioNetwork.setPaused(this.animationsPaused);
      },
      focusMessage: function () {
        var field = this.view === "home" ? this.$refs.homeMessage : this.$refs.message;
        if (field) field.focus();
      },
      executeLocal: function () {
        this.localResultCommand = this.localCommand;
        if (this.localCommand === "whoami") {
          var biography = document.querySelector("#about .view-lead");
          this.localResult = biography ? [biography.textContent.trim()] : [];
          this.localResultHref = "#about";
          this.localResultLink = language === "fr" ? "Voir le parcours ↗" : "View career ↗";
        } else {
          this.localResult = Array.from(document.querySelectorAll("#certs .ab-cert")).map(function (cert) {
            return cert.querySelector(".ab-cert-name").textContent.trim() + " | " + cert.querySelector(".ab-cert-date").textContent.trim();
          });
          this.localResultHref = "#certs";
          this.localResultLink = language === "fr" ? "Voir les certifications ↗" : "View certifications ↗";
        }
      },
      init: function () {
        var self = this;
        document.documentElement.classList.add("enhanced");
        routeListener = function () { self.readRoute(true); };
        window.addEventListener("hashchange", routeListener);
        this.readRoute(false);
        var year = document.getElementById("year");
        if (year) year.textContent = new Date().getFullYear();
        sendListener = function (message) {
          if (!activeSend || !message || message.type !== "text" || message.content !== activeSend.text) return;
          clearTimeout(sendTimer);
          if (self.input.trim() === activeSend.text) self.input = "";
          activeSend = null;
          self.status = "sent";
          self.statusText = t.sent;
        };
      },
      destroy: function () {
        window.removeEventListener("hashchange", routeListener);
        clearTimeout(sendTimer);
        sendListener = null;
      },
      readRoute: function (focus) {
        if (window.location.hash === "#main-content") {
          this.$nextTick(function () {
            var main = document.getElementById("main-content");
            if (main) main.focus({ preventScroll: true });
          });
          return;
        }
        this.routeHash = window.location.hash || "#home";
        var route = window.location.hash.slice(1).split("/");
        var known = ["home", "projects", "about", "contact"];
        var previous = this.view;
        this.view = known.indexOf(route[0]) >= 0 ? route[0] : "home";
        if (["ab-hist", "certs", "parcours"].indexOf(route[0]) >= 0) this.view = "about";
        if (this.view === "contact" && ["hiring", "consulting"].indexOf(route[1]) >= 0) this.intent = route[1];
        var self = this;
        this.$nextTick(function () {
          window.requestAnimationFrame(function () {
          if (self.view === "about" && ["doit", "cloudreach"].indexOf(route[1]) >= 0) {
            var role = document.getElementById("role-" + route[1]);
            if (role) {
              var details = role.querySelector("details");
              if (details) details.open = true;
              role.scrollIntoView();
            }
          } else if (route[0] === "ab-hist") {
            var history = document.getElementById("ab-hist");
            if (history) { history.open = true; history.scrollIntoView(); }
          } else if (route[0] === "certs" || route[0] === "parcours") {
            var section = document.getElementById(route[0]);
            if (section) section.scrollIntoView();
          } else if (focus && previous !== self.view) {
            window.scrollTo({ top: 0, behavior: "instant" });
          }
          if (focus) {
            var heading = document.getElementById(self.view + "-title");
            if (heading) heading.focus({ preventScroll: true });
          }
          });
        });
      },
      languageHref: function () {
        return (language === "fr" ? "en/" : "../") + this.routeHash;
      },
      selectIntent: function (intent) {
        this.intent = intent;
        this.routeHash = "#contact/" + intent;
        window.history.replaceState(null, "", this.routeHash);
      },
      useSuggestion: function (text) {
        if (this.busy) return;
        if (!this.input.trim()) { this.input = text; this.statusText = ""; this.status = "idle"; }
        else this.statusText = t.saved;
        this.focusMessage();
      },
      openChat: async function () {
        if (this.busy) return;
        this.chatLoading = true;
        this.statusText = t.loading;
        this.status = "loading";
        try {
          await loadChat(language);
          revealChat();
          this.status = "ready";
          this.statusText = t.ready;
        } catch (error) {
          this.status = "error";
          this.statusText = sdkReady ? t.chatFailed : t.unavailable;
        } finally { this.chatLoading = false; }
      },
      submit: async function () {
        if (this.busy) return;
        if (this.localCommand) { this.executeLocal(); return; }
        var text = this.input.trim();
        if (!text) {
          this.status = "error"; this.statusText = t.empty;
          this.focusMessage();
          return;
        }
        if (activeSend) { this.status = "error"; this.statusText = t.uncertain; return; }
        this.chatLoading = true;
        this.status = "loading";
        this.statusText = t.loading;
        try { await loadChat(language); }
        catch (error) { this.chatLoading = false; this.status = "error"; this.statusText = t.unavailable; return; }
        this.chatLoading = false;
        this.status = "sending";
        this.statusText = t.sending;
        activeSend = { text: text };
        var self = this;
        sendTimer = setTimeout(function () { self.status = "error"; self.statusText = t.uncertain; }, 10000);
        try { window.$crisp.push(["do", "message:send", ["text", text]]); }
        catch (error) {
          clearTimeout(sendTimer); activeSend = null;
          this.status = "error"; this.statusText = t.failed; return;
        }
        try { revealChat(); } catch (error) { /* Sent confirmation is independent of widget visibility. */ }
      }
    };
  };
})();
