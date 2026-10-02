const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function harness(language = 'fr', hash = '#home') {
  const timers = new Map();
  const events = {};
  const scripts = [];
  const commands = [];
  const callbacks = {};
  const elements = {};
  const biography = { textContent: 'Approved biography' };
  const certificates = ['AWS Professional', 'Microsoft Expert'].map(name => ({
    querySelector(selector) { return { textContent: selector === '.ab-cert-name' ? name : '2026 - 2028' }; },
  }));
  let sequence = 0;
  let now = 0;
  let throwSend = false;
  const window = {
    location: { hash },
    history: { replaceState(_state, _title, value) { window.location.hash = value; } },
    addEventListener(name, fn) { events[name] = fn; },
    removeEventListener(name) { delete events[name]; },
    scrollTo() {},
    requestAnimationFrame(fn) { fn(); },
  };
  const document = {
    documentElement: { lang: language, classList: { add() {} } },
    head: { appendChild(script) { scripts.push(script); } },
    createElement() { return {}; },
    getElementById(id) { return elements[id] || null; },
    querySelector() { return biography; },
    querySelectorAll() { return certificates; },
  };
  const context = vm.createContext({
    window, document, Promise, Date, Error,
    setTimeout(fn, delay) { const id = ++sequence; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  vm.runInContext(source, context);
  const app = window.portfolio();
  const focus = [];
  app.$refs = { message: { focus() { focus.push('contact'); } }, homeMessage: { focus() { focus.push('home'); } } };
  app.$nextTick = fn => fn();
  app.init();
  function ready() {
    window.$crisp = {
      push(command) {
        if (throwSend && command[1] === 'message:send') throw new Error('simulated-send-error');
        commands.push(command);
        if (command[0] === 'on') callbacks[command[1]] = command[2];
      },
    };
    window.CRISP_READY_TRIGGER();
  }
  function tick(ms) {
    now += ms;
    for (const [id, timer] of [...timers]) {
      if (timer.at <= now) { timers.delete(id); timer.fn(); }
    }
  }
  function route(next) { window.location.hash = next; events.hashchange(); }
  const sends = () => commands.filter(command => command[1] === 'message:send');
  return { app, window, scripts, commands, callbacks, elements, biography, certificates, focus, ready, tick, route, sends, failSend() { throwSend = true; } };
}

for (const language of ['fr', 'en']) {
  test(`${language}: exact commands use existing content locally and retain the draft`, async () => {
    const h = harness(language);
    h.app.input = 'whoami';
    assert.equal(h.app.localCommand, 'whoami');
    await h.app.submit();
    assert.deepEqual(Array.from(h.app.localResult), [h.biography.textContent]);
    assert.equal(h.app.localResultHref, '#about');
    h.route('#contact');
    assert.equal(h.app.input, 'whoami');
    h.app.input = 'kubectl get certifs';
    await h.app.submit();
    assert.equal(h.app.localResult.length, h.certificates.length);
    assert.equal(h.app.localResultHref, '#certs');
    assert.equal(h.app.input, 'kubectl get certifs');
    assert.equal(h.window.$crisp, undefined);
    assert.equal(h.scripts.length, 0);
    assert.equal(h.sends().length, 0);
    for (const text of ['whoami ', ' whoami', 'WHOAMI', 'whoami\n', 'kubectl get certifs please']) {
      h.app.input = text;
      assert.equal(h.app.localCommand, '', 'other messages keep the explicit send action');
    }
  });

  test(`${language}: projects route, suggestions focus and shared sending state survive navigation`, async () => {
    const h = harness(language, '#projects');
    assert.equal(h.app.view, 'projects');
    assert.ok(h.app.languageHref().endsWith('#projects'));
    h.route('#home');
    h.app.useSuggestion(h.app.suggestions[0]);
    assert.equal(h.focus.at(-1), 'home');
    const draft = h.app.input;
    const sending = h.app.submit();
    h.route('#contact/consulting');
    assert.equal(h.app.input, draft);
    assert.equal(h.app.busy, true);
    h.app.useSuggestion(h.app.suggestions[1]);
    assert.equal(h.app.input, draft);
    h.ready();
    await sending;
    h.route('#home');
    assert.equal(h.app.status, 'sending');
    await h.app.submit();
    assert.equal(h.sends().length, 1);
    h.callbacks['message:sent']({ type: 'text', content: draft });
    assert.equal(h.app.input, '');
  });

  test(`${language}: initial page and suggestions never load or send chat`, () => {
    const h = harness(language);
    assert.equal(h.scripts.length, 0);
    assert.equal(h.window.$crisp, undefined);
    h.app.useSuggestion(h.app.suggestions[0]);
    assert.equal(h.app.input, h.app.suggestions[0]);
    h.app.useSuggestion(h.app.suggestions[1]);
    assert.equal(h.app.input, h.app.suggestions[0], 'existing draft is preserved');
    assert.equal(h.scripts.length, 0);
  });

  test(`${language}: duplicate clicks cannot send twice; only a matching event clears draft`, async () => {
    const h = harness(language);
    h.app.input = 'A real draft\nwith a second line';
    const sending = h.app.submit();
    await h.app.submit();
    assert.equal(h.scripts.length, 1);
    assert.equal(h.app.status, 'loading');
    h.ready();
    await sending;
    assert.equal(h.sends().length, 1);
    assert.equal(h.app.status, 'sending');
    assert.notEqual(h.app.input, '');
    h.callbacks['message:sent']({ type: 'text', content: 'another message' });
    assert.equal(h.app.status, 'sending');
    h.callbacks['message:sent']({ type: 'file', content: h.app.input });
    assert.equal(h.app.status, 'sending');
    h.callbacks['message:sent']({ type: 'text', content: h.app.input });
    assert.equal(h.app.status, 'sent');
    assert.equal(h.app.input, '');
  });

  test(`${language}: readiness timeout retains draft and late readiness does not send`, async () => {
    const h = harness(language);
    h.app.input = 'Keep this draft';
    const sending = h.app.submit();
    h.tick(4000);
    await sending;
    assert.equal(h.app.status, 'error');
    assert.equal(h.app.input, 'Keep this draft');
    h.ready();
    assert.equal(h.sends().length, 0);
    assert.equal(h.app.status, 'error');
    const retry = h.app.submit();
    await retry;
    assert.equal(h.sends().length, 1, 'new explicit submission can use the now-ready SDK');
  });

  test(`${language}: SDK load error and send exception never report success`, async () => {
    const blocked = harness(language);
    blocked.app.input = 'Keep blocked draft';
    const waiting = blocked.app.submit();
    blocked.scripts[0].onerror();
    await waiting;
    assert.equal(blocked.app.status, 'error');
    assert.equal(blocked.app.input, 'Keep blocked draft');
    const failed = harness(language);
    failed.app.input = 'Keep failed draft';
    const sending = failed.app.submit();
    failed.ready();
    failed.failSend();
    await sending;
    assert.equal(failed.app.status, 'error');
    assert.equal(failed.app.input, 'Keep failed draft');
  });

  test(`${language}: missing confirmation prevents duplicate retry, late confirmation preserves edited draft`, async () => {
    const h = harness(language);
    h.app.input = 'Original draft';
    const sending = h.app.submit();
    h.ready();
    await sending;
    h.tick(10000);
    assert.equal(h.app.status, 'error');
    await h.app.submit();
    assert.equal(h.sends().length, 1);
    h.app.input = 'Edited draft';
    h.callbacks['message:sent']({ type: 'text', content: 'Original draft' });
    assert.equal(h.app.status, 'sent');
    assert.equal(h.app.input, 'Edited draft');
  });

  test(`${language}: navigation, deep links and language switching retain view and intent`, () => {
    const h = harness(language, '#contact/consulting');
    assert.equal(h.app.view, 'contact');
    assert.equal(h.app.intent, 'consulting');
    assert.equal(h.app.languageHref(), (language === 'fr' ? 'en/' : '../') + '#contact/consulting');
    h.app.input = 'Unsent draft';
    h.route('#about');
    assert.equal(h.app.view, 'about');
    h.route('#contact/hiring');
    assert.equal(h.app.intent, 'hiring');
    assert.equal(h.app.input, 'Unsent draft');
    h.app.selectIntent('consulting');
    assert.equal(h.window.location.hash, '#contact/consulting');
    h.route('#main-content');
    assert.equal(h.app.view, 'contact', 'skip link must not switch views');
    h.route('#certs');
    assert.equal(h.app.view, 'about');
    h.route('#unknown');
    assert.equal(h.app.view, 'home');
  });

  test(`${language}: opening chat does not send; empty submission does not load chat`, async () => {
    const h = harness(language);
    await h.app.submit();
    assert.equal(h.app.status, 'error');
    assert.equal(h.scripts.length, 0);
    const opened = h.app.openChat();
    h.ready();
    await opened;
    assert.equal(h.sends().length, 0);
    assert.equal(h.app.status, 'ready');
  });
}
