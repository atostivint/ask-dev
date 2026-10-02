const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'bg-network.js'), 'utf8');

function createNetwork({ reduceMotion = false, hash = '#home', hidden = false } = {}) {
  const windowEvents = {};
  const documentEvents = {};
  const motionEvents = {};
  const frames = new Map();
  let scheduled = 0;
  let draws = 0;
  const context = new Proxy({}, {
    get(_target, name) { return () => { if (name === 'clearRect') draws++; }; },
    set() { return true; },
  });
  const canvas = { hidden: false, style: {}, getContext() { return context; } };
  const media = { matches: reduceMotion, addEventListener(name, callback) { motionEvents[name] = callback; } };
  const window = {
    location: { hash }, innerWidth: 390, innerHeight: 844, devicePixelRatio: 1,
    matchMedia() { return media; },
    addEventListener(name, callback) { windowEvents[name] = callback; },
  };
  const document = {
    hidden,
    getElementById() { return canvas; },
    addEventListener(name, callback) { documentEvents[name] = callback; },
  };
  const sandbox = vm.createContext({
    window, document,
    requestAnimationFrame(callback) { const id = ++scheduled; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  vm.runInContext(source, sandbox);

  return {
    window, document, canvas, frames,
    get draws() { return draws; },
    get scheduled() { return scheduled; },
    frame() { const [id, callback] = frames.entries().next().value; frames.delete(id); callback(); },
    motion(matches) { media.matches = matches; motionEvents.change({ matches }); },
    visible(hidden) { document.hidden = hidden; documentEvents.visibilitychange(); },
    route(hash) { window.location.hash = hash; windowEvents.hashchange(); },
    view(name) { window.portfolioNetwork.setView(name); },
    pause(value) { window.portfolioNetwork.setPaused(value); },
  };
}

test('reduced motion draws one static frame and never schedules animation frames', () => {
  const network = createNetwork({ reduceMotion: true });
  assert.equal(network.draws, 1);
  assert.equal(network.scheduled, 0);
  network.pause(true);
  network.pause(false);
  network.visible(true);
  network.visible(false);
  network.route('#about');
  network.route('#home');
  assert.equal(network.scheduled, 0);
  assert.equal(network.frames.size, 0);

  network.motion(false);
  assert.equal(network.frames.size, 1);
  network.pause(true);
  assert.equal(network.frames.size, 0);
  network.pause(false);
  assert.equal(network.frames.size, 1);
});

test('network pauses outside Home and while hidden, then resumes with one frame loop', () => {
  const network = createNetwork();
  assert.equal(network.frames.size, 1);
  network.frame();
  assert.equal(network.frames.size, 1);

  network.view('contact');
  assert.equal(network.canvas.hidden, true);
  assert.equal(network.frames.size, 0);
  network.view('home');
  assert.equal(network.canvas.hidden, false);
  assert.equal(network.frames.size, 1);

  network.visible(true);
  assert.equal(network.frames.size, 0);
  network.visible(false);
  assert.equal(network.frames.size, 1);
  network.pause(true);
  network.pause(false);
  assert.equal(network.frames.size, 1);
});
