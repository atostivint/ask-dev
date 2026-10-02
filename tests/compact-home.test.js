const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function createPage(language = 'fr', hash = '#home') {
  const timers = new Map();
  const handlers = {};
  const scripts = [];
  const commands = [];
  const sentHandlers = [];
  const elements = { 'q-input': { style: {}, scrollHeight: 40, focus() {} } };
  let timerId = 0;
  let throwOnSend = false;
  let syncSentMessage = null;
  const window = {
    location: { hash },
    history: { pushState(_state, _title, next) { window.location.hash = next; } },
    addEventListener(name, callback) { handlers[name] = callback; },
    matchMedia() { return { matches: false }; },
  };
  const document = {
    hidden: false,
    documentElement: { lang: language },
    head: { appendChild(script) { scripts.push(script); } },
    createElement() { return {}; },
    getElementById(id) { return elements[id] || null; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener() {},
  };
  const context = vm.createContext({
    window, document, navigator: {}, Promise,
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  vm.runInContext(source, context);
  const app = window.portfolio();
  app.$nextTick = callback => callback();
  app.$refs = { qInput: { focus() {} } };
  app.init();

  function crispReady(message) {
    syncSentMessage = message || null;
    window.$crisp = {
      push(command) {
        if (throwOnSend && command[1] === 'message:send') throw new Error('simulated Crisp failure');
        commands.push(command);
        if (command[0] === 'on' && command[1] === 'message:sent') sentHandlers.push(command[2]);
        if (syncSentMessage && command[1] === 'message:send') {
          const message = syncSentMessage;
          syncSentMessage = null;
          sentHandlers[sentHandlers.length - 1](message);
        }
      },
    };
    window.CRISP_READY_TRIGGER();
  }

  return {
    app, window, scripts, commands, sentHandlers, timers,
    crispReady,
    failLoad() { scripts[0].onerror(); },
    failSend() { throwOnSend = true; },
    expireConfirmation() {
      const pending = [...timers.entries()].find(([, timer]) => timer.delay === 15000);
      if (pending) { timers.delete(pending[0]); pending[1].callback(); }
    },
    route(hash) { window.location.hash = hash; handlers.hashchange(); },
  };
}

for (const language of ['fr', 'en']) {
  test(`${language}: deep links and view changes stay reflected in browser history`, () => {
    const page = createPage(language, '#contact');
    assert.equal(page.app.view, 'contact');
    page.app.setView('about');
    assert.equal(page.window.location.hash, '#about');
    assert.equal(page.app.view, 'about');
  });

  test(`${language}: home stays local until explicit send; suggestions only fill an empty draft`, () => {
    const page = createPage(language);
    assert.equal(page.scripts.length, 0);
    assert.equal(page.window.$crisp, undefined);

    page.app.useSuggestion('Suggested question');
    assert.equal(page.app.input, 'Suggested question');
    assert.equal(page.scripts.length, 0);
    page.app.input = 'My own draft';
    page.app.useSuggestion('Another question');
    assert.equal(page.app.input, 'My own draft');
    assert.equal(page.scripts.length, 0);
  });

  test(`${language}: navigation preserves draft and an explicit send is deduplicated until matching confirmation`, async () => {
    const page = createPage(language);
    page.app.input = 'A question for Alexandre';
    page.route('#about');
    assert.equal(page.app.view, 'about');
    assert.equal(page.app.input, 'A question for Alexandre');
    page.route('#home');

    const first = page.app.submit('qInput');
    await page.app.submit('qInput');
    assert.equal(page.scripts.length, 1);
    assert.equal(page.app.input, 'A question for Alexandre');
    assert.equal(page.app.sendState, 'loading');
    assert.match(page.app.sendStatus, language === 'fr' ? /^Ouverture/ : /^Opening/);

    page.crispReady();
    await first;
    assert.equal(page.commands.filter(command => command[1] === 'message:send').length, 1);
    assert.equal(page.app.sendState, 'sending');
    page.app.input = 'A newer edit';
    page.sentHandlers[0]({ content: 'A different message' });
    assert.equal(page.app.input, 'A newer edit');
    assert.equal(page.app.sendState, 'sending');
    page.sentHandlers[0]({ content: 'A question for Alexandre' });
    assert.equal(page.app.input, 'A newer edit');
    assert.equal(page.app.sendState, 'sent');
  });

  test(`${language}: Crisp load failure retains the draft and never reports delivery`, async () => {
    const page = createPage(language);
    page.app.input = 'Keep this message';
    const sending = page.app.submit();
    page.failLoad();
    await sending;
    assert.equal(page.app.input, 'Keep this message');
    assert.equal(page.app.sendState, 'failed');
    assert.equal(page.commands.filter(command => command[1] === 'message:send').length, 0);
  });

  test(`${language}: late readiness after load failure waits for the next explicit send`, async () => {
    const page = createPage(language);
    page.app.input = 'Do not auto-send this draft';
    const first = page.app.submit();
    page.failLoad();
    await first;
    assert.equal(page.app.sendState, 'failed');

    page.crispReady();
    assert.equal(page.window.ASK_CRISP.getState(), 'ready');
    assert.equal(page.app.input, 'Do not auto-send this draft');
    assert.equal(page.commands.filter(command => command[1] === 'message:send').length, 0);

    page.app.submit();
    assert.equal(page.commands.filter(command => command[1] === 'message:send').length, 1);
    assert.equal(page.app.sendState, 'sending');
  });

  test(`${language}: synchronous matching sent event confirms without throwing`, async () => {
    const page = createPage(language);
    page.app.input = 'Confirmed during Crisp push';
    const sending = page.app.submit();
    assert.doesNotThrow(() => page.crispReady({ content: 'Confirmed during Crisp push' }));
    await sending;
    assert.equal(page.app.sendState, 'sent');
    assert.equal(page.app.input, '');
    assert.equal(page.window.ASK_CRISP.getActiveSend(), null);
  });

  test(`${language}: late script errors cannot downgrade a ready Crisp client`, async () => {
    const page = createPage(language);
    page.app.input = 'First message';
    const first = page.app.submit();
    page.crispReady();
    await first;
    page.sentHandlers[0]({ content: 'First message' });
    page.failLoad();
    assert.equal(page.window.ASK_CRISP.getState(), 'ready');

    page.app.input = 'Second message';
    page.app.submit();
    assert.equal(page.scripts.length, 1);
    assert.equal(page.commands.filter(command => command[1] === 'message:send').length, 2);
  });

  test(`${language}: send exception or missing confirmation retains the draft`, async () => {
    const failed = createPage(language);
    failed.app.input = 'Keep after a runtime error';
    const failedSend = failed.app.submit();
    failed.failSend();
    failed.crispReady();
    await failedSend;
    assert.equal(failed.app.input, 'Keep after a runtime error');
    assert.equal(failed.app.sendState, 'uncertain');

    const unconfirmed = createPage(language);
    unconfirmed.app.input = 'Keep until confirmation';
    const pending = unconfirmed.app.submit();
    unconfirmed.crispReady();
    await pending;
    unconfirmed.expireConfirmation();
    assert.equal(unconfirmed.app.input, 'Keep until confirmation');
    assert.equal(unconfirmed.app.sendState, 'uncertain');
    assert.equal(unconfirmed.window.ASK_CRISP.getUnresolvedText(), 'Keep until confirmation');

    unconfirmed.app.submit();
    assert.equal(unconfirmed.commands.filter(command => command[1] === 'message:send').length, 1,
      'the unchanged uncertain draft must not be sent again');
    assert.equal(unconfirmed.app.input, 'Keep until confirmation');

    unconfirmed.app.input = 'A distinct draft';
    unconfirmed.app.submit();
    assert.equal(unconfirmed.commands.filter(command => command[1] === 'message:send').length, 2,
      'a different draft can be sent explicitly');
  });
}
