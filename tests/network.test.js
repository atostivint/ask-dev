const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'bg-network.js'), 'utf8');

function network({ reduce = false, hash = '#home', hidden = false } = {}) {
  const frames = new Map();
  const events = {};
  let scheduled = 0;
  let draws = 0;
  const ctx = new Proxy({}, { get(_target, name) { return () => { if (name === 'clearRect') draws++; }; }, set() { return true; } });
  const canvas = { style: {}, hidden: false, getContext() { return ctx; } };
  const media = { matches: reduce, addEventListener(_name, fn) { events.motion = fn; } };
  const window = {
    location: { hash }, innerWidth: 390, innerHeight: 844,
    matchMedia() { return media; },
    addEventListener(name, fn) { events[name] = fn; },
  };
  const document = {
    hidden, getElementById() { return canvas; },
    addEventListener(name, fn) { events[name] = fn; },
  };
  const context = vm.createContext({ window, document,
    requestAnimationFrame(fn) { const id = ++scheduled; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  vm.runInContext(source, context);
  return {
    frames, canvas, window,
    get scheduled() { return scheduled; }, get draws() { return draws; },
    frame() { const [id, fn] = frames.entries().next().value; frames.delete(id); fn(); },
    route(hash) { window.location.hash = hash; events.hashchange(); },
    resize() { events.resize(); },
    visibility(hidden) { document.hidden = hidden; events.visibilitychange(); },
    motion(matches) { events.motion({ matches }); },
    pause(value) { window.portfolioNetwork.setPaused(value); },
  };
}

test('reduced motion draws a static network and never schedules a frame, including resize and visibility', () => {
  const h = network({ reduce: true });
  assert.equal(h.draws, 1);
  h.resize(); h.visibility(true); h.visibility(false); h.pause(true); h.pause(false);
  assert.equal(h.scheduled, 0);
  assert.equal(h.frames.size, 0);
  h.motion(false);
  assert.equal(h.frames.size, 1);
  h.frame();
  assert.equal(h.frames.size, 1);
  h.motion(true);
  assert.equal(h.frames.size, 0);
});

test('network runs only on Home, pauses in hidden tabs and keeps one cancellable loop', () => {
  const h = network();
  assert.equal(h.frames.size, 1);
  h.frame();
  assert.equal(h.frames.size, 1);
  h.pause(true);
  assert.equal(h.frames.size, 0);
  h.pause(false);
  h.visibility(true);
  assert.equal(h.frames.size, 0);
  h.visibility(false);
  assert.equal(h.frames.size, 1);
  for (const route of ['#projects', '#about', '#contact', '#certs', '#parcours', '#ab-hist']) {
    h.route(route);
    assert.equal(h.canvas.hidden, true);
    assert.equal(h.frames.size, 0);
    h.route('#main-content'); h.resize();
    assert.equal(h.frames.size, 0, 'skip link and resize retain the current view');
  }
  h.route('#home');
  assert.equal(h.canvas.hidden, false);
  assert.equal(h.frames.size, 1);
});

test('deep links and hidden initial tabs do not start animation', () => {
  assert.equal(network({ hash: '#about/doit' }).scheduled, 0);
  assert.equal(network({ hash: '#contact/consulting' }).scheduled, 0);
  assert.equal(network({ hidden: true }).scheduled, 0);
});
