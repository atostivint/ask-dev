(function () {
  "use strict";

  var WEBSITE_ID = "-K4rlGkym4Yw7OXHl99n";
  var crispState = "idle";
  var crispWaiters = [];
  var crispLoadTimer = null;
  var activeSend = null;
  var unresolvedText = null;
  var isEnglish = (document.documentElement.lang || "fr").toLowerCase().slice(0, 2) === "en";
  var copy = isEnglish ? {
    loading: "Opening the chat…",
    sending: "Waiting for Crisp to confirm the message…",
    sent: "Crisp confirmed that your message was sent.",
    uncertain: "Crisp has not confirmed the message. Your draft is still here. Check the chat before trying again.",
    chatFailed: "The chat could not be opened. Your draft is still here. Try LinkedIn or email below.",
    loadFailed: "The chat could not be loaded. Your draft is still here. Try LinkedIn or email below.",
    blank: "Choose a suggestion or write your own message.",
    suggestion: "Suggestion added to your draft."
  } : {
    loading: "Ouverture du chat…",
    sending: "En attente de confirmation de Crisp…",
    sent: "Crisp a confirmé l’envoi de votre message.",
    uncertain: "Crisp n’a pas confirmé le message. Votre brouillon est conservé. Vérifiez le chat avant de réessayer.",
    chatFailed: "Le chat n’a pas pu s’ouvrir. Votre brouillon est conservé. Essayez LinkedIn ou l’email ci-dessous.",
    loadFailed: "Le chat n’a pas pu se charger. Votre brouillon est conservé. Essayez LinkedIn ou l’email ci-dessous.",
    blank: "Choisissez une suggestion ou écrivez votre message.",
    suggestion: "Suggestion ajoutée au brouillon."
  };

  function autoGrow(ta) {
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }

  function growInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("textarea[x-model='input']"), autoGrow);
  }

  function finishLoad(ok) {
    if (crispState !== "loading") return;
    if (crispLoadTimer) clearTimeout(crispLoadTimer);
    crispLoadTimer = null;
    crispState = ok ? "ready" : "failed";
    var waiters = crispWaiters.slice();
    crispWaiters.length = 0;
    waiters.forEach(function (done) { done(ok); });
  }

  function crispReady() {
    try { window.$crisp.push(["do", "launcher:hide"]); } catch (e) {}
    if (crispState === "loading") {
      finishLoad(true);
      return;
    }
    if (crispState === "failed") crispState = "ready";
  }

  function loadCrisp(done) {
    if (crispState === "ready") { done(true); return; }
    if (crispState === "failed") { done(false); return; }
    crispWaiters.push(done);
    if (crispState === "loading") return;

    crispState = "loading";
    window.CRISP_WEBSITE_ID = WEBSITE_ID;
    window.$crisp = window.$crisp || [];
    window.CRISP_READY_TRIGGER = crispReady;
    var script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    script.onerror = function () { finishLoad(false); };
    crispLoadTimer = setTimeout(function () { finishLoad(false); }, 4000);
    document.head.appendChild(script);
  }

  function readSentText(message) {
    if (typeof message === "string") return message;
    if (message && typeof message.content === "string") return message.content;
    return null;
  }

  function sendThroughCrisp(text, onConfirm, onError) {
    var attempt = { text: text, onConfirm: onConfirm, onError: onError, timer: null };
    var callback = function (message) {
      if (activeSend !== attempt || readSentText(message) !== attempt.text) return;
      if (attempt.timer) clearTimeout(attempt.timer);
      try { window.$crisp.push(["off", "message:sent"]); } catch (e) {}
      activeSend = null;
      unresolvedText = null;
      attempt.onConfirm();
    };
    activeSend = attempt;
    try {
      window.$crisp.push(["off", "message:sent"]);
      window.$crisp.push(["on", "message:sent", callback]);
      attempt.callback = callback;
      attempt.sendIssued = true;
      window.$crisp.push(["do", "message:send", ["text", text]]);
      window.$crisp.push(["do", "chat:open"]);
    } catch (e) {
      if (activeSend === attempt) {
        try { window.$crisp.push(["off", "message:sent"]); } catch (ignored) {}
        activeSend = null;
        if (attempt.sendIssued) unresolvedText = text;
        onError(!!attempt.sendIssued);
      }
      return;
    }
    if (activeSend === attempt) {
      attempt.timer = setTimeout(function () {
        if (activeSend !== attempt) return;
        try { window.$crisp.push(["off", "message:sent"]); } catch (e) {}
        activeSend = null;
        unresolvedText = text;
        onError(true);
      }, 15000);
    }
  }

  function portfolio() {
    return {
      view: "home",
      input: "",
      sending: false,
      sendState: "idle",
      sendStatus: "",
      networkPaused: false,
      languageHref: "",

      init: function () {
        var self = this;
        this.networkPaused = false;
        this._syncLanguageHref();
        this._applyViewFromHash(!!window.location.hash);
        window.addEventListener("hashchange", function () { self._applyViewFromHash(true); });
        window.addEventListener("popstate", function () { self._applyViewFromHash(true); });
        document.addEventListener("visibilitychange", function () {
          if (window.portfolioNetwork && window.portfolioNetwork.setPaused) {
            window.portfolioNetwork.setPaused(document.hidden || self.networkPaused);
          }
        });
        this.$nextTick(function () { autoGrow(document.getElementById("q-input")); });
        document.addEventListener("input", function (event) {
          if (event.target && event.target.matches("textarea[x-model='input']")) {
            autoGrow(event.target);
            if (!self.sending && self.sendStatus) {
              var stillUnresolved = self.sendState === "uncertain" && unresolvedText && event.target.value.trim() === unresolvedText;
              if (!stillUnresolved) {
                self.sendState = "idle";
                self.sendStatus = "";
              }
            }
          }
        }, true);

        var isEn = document.documentElement.lang === "en";
        var labelCopy = isEn ? "Copy" : "Copier";
        var labelCopied = isEn ? "Copied" : "Copié";
        document.addEventListener("click", function (event) {
          var btn = event.target.closest(".contact-copy");
          if (!btn) return;
          var value = btn.getAttribute("data-copy");
          if (!value || !navigator.clipboard || !navigator.clipboard.writeText) return;
          navigator.clipboard.writeText(value).then(function () {
            btn.textContent = labelCopied;
            btn.classList.add("copied");
            setTimeout(function () { btn.textContent = labelCopy; btn.classList.remove("copied"); }, 2000);
          });
        });
        if (window.portfolioNetwork && window.portfolioNetwork.setPaused) {
          window.portfolioNetwork.setPaused(document.hidden || this.networkPaused);
        }
      },

      _applyViewFromHash: function (focus) {
        var key = (window.location.hash || "#home").slice(1);
        var allowed = ["home", "about", "testimonials", "contact"];
        var section = null;
        if (["certs", "parcours", "projects", "project-finops", "ab-hist"].indexOf(key) >= 0) {
          section = key;
          key = "about";
        }
        if (allowed.indexOf(key) < 0) key = "home";
        this.view = key;
        this._syncLanguageHref();
        if (window.portfolioNetwork && window.portfolioNetwork.setView) window.portfolioNetwork.setView(key);
        if (key === "about") this._animateStats();
        if (focus) {
          var self = this;
          this.$nextTick(function () {
            if (section) {
              var target = document.getElementById(section);
              if (target) {
                target.scrollIntoView({ block: "start" });
                if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
                target.focus();
                return;
              }
            }
            self._focusView(key);
          });
        }
      },

      _focusView: function (view) {
        var target = document.querySelector("[data-view-focus='" + view + "']");
        if (!target) target = document.getElementById(view);
        if (target) {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus();
        }
      },

      _syncLanguageHref: function () {
        var isEn = document.documentElement.lang === "en";
        this.languageHref = (isEn ? "../" : "en/") + (window.location.hash || "#home");
      },

      setView: function (view) {
        var allowed = ["home", "about", "testimonials", "contact"];
        if (allowed.indexOf(view) < 0) return;
        this.view = view;
        if (window.location.hash !== "#" + view) window.history.pushState({ view: view }, "", "#" + view);
        this._syncLanguageHref();
        if (window.portfolioNetwork && window.portfolioNetwork.setView) window.portfolioNetwork.setView(view);
        if (view === "about") this._animateStats();
        var self = this;
        this.$nextTick(function () { self._focusView(view); });
      },

      toggleAnimations: function () {
        this.networkPaused = !this.networkPaused;
        if (window.portfolioNetwork && window.portfolioNetwork.setPaused) {
          window.portfolioNetwork.setPaused(document.hidden || this.networkPaused);
        }
      },

      _animateStats: function () {
        var els = document.querySelectorAll(".count");
        if (!els.length) return;
        Array.prototype.forEach.call(els, function (el) {
          el.textContent = el.getAttribute("data-target") || el.textContent;
        });
      },

      submit: function (ref) {
        var text = (this.input || "").trim();
        var draftAtSubmit = this.input;
        if (!text) {
          this.sendState = "idle";
          this.sendStatus = copy.blank;
          if (ref && this.$refs[ref]) this.$refs[ref].focus();
          return;
        }
        if (this.sending || activeSend) return;
        if (unresolvedText && text === unresolvedText) {
          this.sendState = "uncertain";
          this.sendStatus = copy.uncertain;
          return;
        }
        this.sending = true;
        this.sendState = "loading";
        this.sendStatus = copy.loading;
        var self = this;
        loadCrisp(function (loaded) {
          if (!loaded) {
            self.sending = false;
            self.sendState = "failed";
            self.sendStatus = copy.loadFailed;
            return;
          }
          self.sendState = "sending";
          self.sendStatus = copy.sending;
          sendThroughCrisp(text, function () {
            if (self.input === draftAtSubmit) self.input = "";
            self.sending = false;
            self.sendState = "sent";
            self.sendStatus = copy.sent;
            growInputs();
          }, function (uncertain) {
            self.sending = false;
            self.sendState = uncertain ? "uncertain" : "failed";
            self.sendStatus = uncertain ? copy.uncertain : copy.loadFailed;
          });
        });
      },

      useSuggestion: function (text) {
        if ((this.input || "").trim()) return;
        this.input = text;
        this.sendState = "draft";
        this.sendStatus = copy.suggestion;
        var field = document.getElementById("q-input") || this.$refs.qInput || this.$refs.contactInput;
        autoGrow(field);
        if (field) field.focus();
      },

      openChatBtn: function () {
        var self = this;
        if (this.sending) return;
        this.sending = true;
        this.sendStatus = copy.loading;
        loadCrisp(function (loaded) {
          self.sending = false;
          if (!loaded) {
            self.sendState = "failed";
            self.sendStatus = copy.loadFailed;
            return;
          }
          try {
            window.$crisp.push(["do", "chat:open"]);
            self.sendState = "chat-open";
            self.sendStatus = "";
          } catch (e) {
            self.sendState = "failed";
            self.sendStatus = copy.chatFailed;
          }
        });
      }
    };
  }

  window.portfolio = portfolio;
  window.ASK_CRISP = {
    getState: function () { return crispState; },
    getActiveSend: function () { return activeSend && { text: activeSend.text }; },
    getUnresolvedText: function () { return unresolvedText; }
  };
})();
