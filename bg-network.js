/* bg-network.js — Particules connectées type réseau, fond de la page Ask.
 *
 * Choix technique (sources : michaeldishmon.com/lab/animated-backgrounds,
 * arraypress/effect-canvas-astro) :
 * - canvas 2D, pas WebGL : coût 2-5 ms/frame en 1080p, GPU libre pour le reste
 * - pause quand hors écran (IntersectionObserver) ou onglet caché
 * - densité bornée par l'aire du viewport (pas par un compteur fixe)
 * - interaction curseur : les particules proches se rattachent au pointeur
 * - prefers-reduced-motion : rendu d'une frame unique, aucune boucle
 * - aria-hidden + pointer-events none : jamais dans le chemin clavier/lisible
 */
(function () {
  "use strict";

  var canvas = document.getElementById("bg-network");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var particles = [];
  var pointer = { x: -9999, y: -9999, active: false };
  var running = false;
  var rafId = null;

  /* Densité : 1 particule / 16000 px², plafond 110, plancher 36 */
  function targetCount() {
    var area = window.innerWidth * window.innerHeight;
    return Math.max(36, Math.min(110, Math.round(area / 16000)));
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    particles = [];
    var n = targetCount();
    for (var i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.0
      });
    }
    /* vy réel */
    for (var j = 0; j < particles.length; j++) {
      particles[j].vy = (Math.random() - 0.5) * 0.22;
    }
  }

  function step() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    var i, j, p, q, dx, dy, dist;

    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      /* Interaction curseur : douce répulsion */
      if (pointer.active) {
        dx = p.x - pointer.x;
        dy = p.y - pointer.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0.01) {
          var f = (140 - dist) / 140 * 0.35;
          p.x += dx / dist * f;
          p.y += dy / dist * f;
        }
      }

      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      if (p.y < -20) p.y = window.innerHeight + 20;
      if (p.y > window.innerHeight + 20) p.y = -20;
    }

    /* Liens entre particules proches */
    for (i = 0; i < particles.length; i++) {
      for (j = i + 1; j < particles.length; j++) {
        p = particles[i]; q = particles[j];
        dx = p.x - q.x; dy = p.y - q.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          var alpha = (1 - dist / 130) * 0.16;
          ctx.strokeStyle = "rgba(79,143,247," + alpha.toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    /* Points */
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      ctx.fillStyle = "rgba(79,143,247,.5)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Lien curseur : le pointeur devient un noeud du réseau */
    if (pointer.active) {
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        dx = p.x - pointer.x; dy = p.y - pointer.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 170) {
          var a2 = (1 - dist / 170) * 0.28;
          ctx.strokeStyle = "rgba(124,108,240," + a2.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
        if (dist < 170) break; /* un seul lien au curseur suffit */
      }
    }

    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    running = true;
    if (reduceMotion) { step(); running = false; return; }
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener("resize", function () {
    resize();
    spawn();
  }, { passive: true });

  window.addEventListener("pointermove", function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  }, { passive: true });

  window.addEventListener("pointerleave", function () {
    pointer.active = false;
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  var io = new IntersectionObserver(function (entries) {
    /* canvas est position:fixed, toujours visible ; garde-fou si un jour inline */
    entries.forEach(function (en) {
      if (en.isIntersecting) start(); else stop();
    });
  });
  io.observe(canvas);

  resize();
  spawn();
  start();
})();
