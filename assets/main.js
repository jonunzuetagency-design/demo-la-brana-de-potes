/* La Braña de Potes — v2 · interacciones */
(function () {
  'use strict';
  var D = window.BRANA, R = window.RESENAS || [];
  var html = document.documentElement;
  var ANIM = html.classList.contains('anim');
  var TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- WhatsApp con texto ---------- */
  $$('[data-wa]').forEach(function (a) { a.href = D.wa(); });
  $$('[data-wa-apt]').forEach(function (a) {
    a.href = D.wa('Hola Esperanza, me interesa el apartamento ' + a.getAttribute('data-wa-apt') + ' de La Braña de Potes. ¿Está libre en estas fechas?: ');
  });

  /* ---------- Split de titulares ---------- */
  $$('[data-split]').forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/([ \n\t]+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^[ \n\t]+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
  });
  $$('[data-letters]').forEach(function (el) {
    var t = el.textContent; el.textContent = '';
    t.split('').forEach(function (c, i) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.style.setProperty('--i', i); el.appendChild(s); });
  });

  /* stagger de hermanos con data-rise */
  $$('[data-rise]').forEach(function (el) {
    var sib = $$(':scope > [data-rise]', el.parentNode);
    var k = sib.indexOf(el);
    if (k > 0) el.style.setProperty('--dl', Math.min(k * 0.09, 0.45) + 's');
  });

  /* ---------- Reveals ---------- */
  // Comprobación por posición (IntersectionObserver ignora los elementos recortados con clip-path)
  var pending = $$('[data-rise], [data-split], .apt__pics figure, .draw, .esp__name, #tally');
  function checkReveal() {
    if (!pending.length) return;
    var vh = innerHeight;
    pending = pending.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) {
        el.classList.add('in');
        if (el.hasAttribute('data-count-wrap')) countUp(el);
        return false;
      }
      return true;
    });
  }

  /* contadores */
  $$('.facts li').forEach(function (li) { li.setAttribute('data-count-wrap', ''); });
  function countUp(li) {
    var n = $('[data-count]', li); if (!n || !ANIM) return;
    var to = parseFloat(n.getAttribute('data-count')), dec = +(n.getAttribute('data-dec') || 0), t0 = performance.now(), dur = 1500;
    (function f(t) {
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      n.textContent = (to * e).toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  /* ---------- Nav ---------- */
  var nav = $('#nav'), fab = $('#fab'), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-solid', y > 30);
    nav.classList.toggle('is-hidden', y > 700 && y > lastY + 2 && !html.classList.contains('menu-open'));
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    fab.classList.toggle('on', y > window.innerHeight * 0.55);
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  addEventListener('scroll', checkReveal, { passive: true }); addEventListener('resize', checkReveal);
  checkReveal(); setTimeout(checkReveal, 300);

  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    html.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', function () { setMenu(!html.classList.contains('menu-open')); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Marquee de nombres (velocidad ligada al scroll) ---------- */
  var nt = $('.names__track'), nx = 0, vel = 0, dir = 1, prevY = scrollY;
  /* ---------- Reel galería ---------- */
  var reel = $('#reel'), track = $('#reelTrack');
  var fotos = D.fotos;
  var itemsHTML = fotos.map(function (f, i) {
    var portrait = f.h > f.w;
    return '<a class="reel__item" href="galeria.html#' + (i + 1) + '" draggable="false" style="aspect-ratio:' + f.w + '/' + f.h + '"><img src="img/' + f.f + '-t.webp" alt="' + esc(f.c) + '" loading="lazy" draggable="false" width="' + (portrait ? 675 : 900) + '" height="' + Math.round((portrait ? 675 : 900) * f.h / f.w) + '"><figcaption>' + esc(f.c) + '</figcaption></a>';
  }).join('');
  track.innerHTML = itemsHTML + itemsHTML.replace(/<a /g, '<a aria-hidden="true" tabindex="-1" ');
  var rx = 0, half = 0, hover = false, drag = null, moved = false;
  function measure() { half = track.scrollWidth / 2; }
  addEventListener('load', measure); addEventListener('resize', measure); measure();
  reel.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
  reel.addEventListener('pointerleave', function () { hover = false; });
  reel.addEventListener('pointerdown', function (e) {
    drag = { x: e.clientX, y: e.clientY, rx: rx, id: e.pointerId, lock: null }; moved = false;
  });
  addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (drag.lock === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      drag.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (drag.lock === 'x') { reel.classList.add('drag'); try { reel.setPointerCapture(drag.id); } catch (_) {} }
    }
    if (drag.lock === 'x') { moved = true; rx = drag.rx + dx; }
  });
  function endDrag() { if (drag) { reel.classList.remove('drag'); drag = null; } }
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
  reel.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);

  var last = performance.now();
  function loop(t) {
    var dt = Math.min((t - last) / 1000, 0.05); last = t;
    // nombres
    var y = scrollY, dy = y - prevY; prevY = y;
    if (dy) dir = dy > 0 ? 1 : -1;
    vel += (Math.abs(dy) * 6 - vel) * 0.08;
    if (ANIM) {
      nx -= (50 + vel) * dt * dir;
      var nh = nt.scrollWidth / 2;
      if (nh) { if (nx <= -nh) nx += nh; if (nx > 0) nx -= nh; }
      nt.style.transform = 'translate3d(' + nx + 'px,0,0)';
    }
    // reel
    if (!drag && !hover && ANIM) rx -= 38 * dt;
    if (half) { while (rx <= -half) rx += half; while (rx > 0) rx -= half; if (drag) drag.rx = drag.rx; }
    track.style.transform = 'translate3d(' + rx + 'px,0,0)';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- Reseñas ---------- */
  var clean = R.map(function (r) {
    var t = r.t.replace(/\s*\?{2,}\s*…?/g, '. ').replace(/\s+\./g, '.').replace(/,(?=\S)/g, ', ').replace(/\.(?=[A-ZÁÉÍÓÚ])/g, '. ').trim();
    return { a: r.a, n: r.n, t: t, cut: /…$/.test(r.t) && !/\?{2,}/.test(r.t) };
  });
  var CATS = [
    { k: 'esp', l: 'Esperanza, por su nombre', c: 'Esperanza', re: /esperanza/gi },
    { k: 'own', l: 'La dueña y su trato', re: /esperanza|due(?:ñ|n)[ao]s?|propietaria|se(?:ñ|n)ora|la mujer|gerente/gi },
    { k: 'amb', l: 'Amabilidad', re: /amab\w*|encantador\w*|atent[ao]s?|simp(?:á|a)tic\w*|trato/gi },
    { k: 'lim', l: 'Limpieza', c: 'Limpieza', re: /limpi\w*|limpieza/gi },
    { k: 'vol', l: 'Volverían', c: 'Volverían', re: /repet\w*|volver\w*|volvamos|volver(?:é|e)/gi },
    { k: 'ubi', l: 'Ubicación', c: 'Ubicación', re: /centr\w*|c(?:é|e)ntric\w*|ubica\w*|situad\w*|posici(?:ó|o)n/gi },
    { k: 'par', l: 'Aparcamiento', c: 'Aparcamiento', re: /parking|parquing|aparcamiento\w*/gi }
  ];
  var test = function (re, t) { re.lastIndex = 0; var r = re.test(t); re.lastIndex = 0; return r; };
  var total = clean.length;
  $$('[data-total]').forEach(function (el) { el.textContent = total; });
  var espN = clean.filter(function (r) { return test(CATS[0].re, r.t); }).length;
  $$('[data-esp-count]').forEach(function (el) { el.textContent = espN; });

  var tally = $('#tally');
  tally.innerHTML = CATS.map(function (c, i) {
    var n = clean.filter(function (r) { return test(c.re, r.t); }).length;
    return '<li><span>' + c.l + '</span><span class="bar"><i style="--w:' + (n / total * 100).toFixed(1) + '%;--d:' + (i * 0.1) + 's"></i></span><b>' + n + '</b></li>';
  }).join('');

  var chips = $('#chips'), wall = $('#wall'), curCat = null;
  var chipCats = [{ k: 'all', c: 'Todas' }].concat(CATS.filter(function (c) { return c.c; }));
  chips.innerHTML = chipCats.map(function (c, i) {
    var n = c.k === 'all' ? clean.filter(function (r) { return !r.cut; }).length : clean.filter(function (r) { return !r.cut && test(c.re, r.t); }).length;
    return '<button class="chip" role="tab" data-k="' + c.k + '" aria-selected="' + (i === 0) + '">' + c.c + ' <small>' + n + '</small></button>';
  }).join('');
  var HL = /esperanza|limpi\w*|limpieza|centro|c(?:é|e)ntric\w*|ubicaci(?:ó|o)n|bien situad\w*|parking|parquing|aparcamiento\w*|repetir\w*|repetiremos|volveremos|acogedor\w*|no (?:le )?falta\w* (?:de )?(?:ningún |un )?detalle/gi;
  function card(r) {
    var ini = r.a.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    var isE = test(/esperanza/i, r.t) && r.t.length > 60;
    var stars = ''; for (var i = 0; i < 5; i++) stars += i < r.n ? '<svg><use href="#i-star"/></svg>' : '';
    var txt = esc(r.t).replace(HL, function (m) { return '<mark>' + m + '</mark>'; });
    return '<article class="card' + (isE ? ' card--esp' : '') + '"><div class="card__who"><span class="card__av" aria-hidden="true">' + esc(ini) + '</span><div><b>' + esc(r.a) + '</b><small><span class="stars" aria-label="' + r.n + ' de 5">' + stars + '</span> Google</small></div></div><p>' + txt + '</p></article>';
  }
  function renderWall(k) {
    var cat = CATS.filter(function (c) { return c.k === k; })[0];
    var list = clean.filter(function (r) { return !r.cut && (!cat || test(cat.re, r.t)); });
    // las largas primero, intercaladas con cortas para dar ritmo
    var longs = list.filter(function (r) { return r.t.length > 70; }).sort(function (a, b) { return b.t.length - a.t.length; });
    var shorts = list.filter(function (r) { return r.t.length <= 70; });
    var mix = []; while (longs.length || shorts.length) { if (longs.length) mix.push(longs.shift()); if (longs.length) mix.push(longs.shift()); if (shorts.length) mix.push(shorts.shift()); }
    var nc = innerWidth <= 860 ? 1 : 3, cols = [];
    for (var c = 0; c < nc; c++) cols.push([]);
    mix.forEach(function (r, i) { cols[i % nc].push(card(r)); });
    wall.innerHTML = cols.map(function (cs, i) {
      var h = cs.join('');
      return '<div class="col' + (i === 1 ? ' col--rev' : '') + '">' + h + '<div aria-hidden="true" style="display:contents">' + h + '</div></div>';
    }).join('');
    requestAnimationFrame(function () {
      $$('.col', wall).forEach(function (col) { col.style.setProperty('--dur', Math.max(col.scrollHeight / 2 / 26, 14) + 's'); });
    });
    curCat = k;
  }
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', chips).forEach(function (c) { c.setAttribute('aria-selected', c === b); });
    renderWall(b.getAttribute('data-k'));
  });
  renderWall('all');
  var wasMobile = innerWidth <= 860;
  addEventListener('resize', function () { var m = innerWidth <= 860; if (m !== wasMobile) { wasMobile = m; renderWall(curCat); } });
  // pausa también al tocar en móvil
  wall.addEventListener('touchstart', function () { wall.classList.add('hold'); }, { passive: true });
  wall.addEventListener('touchend', function () { wall.classList.remove('hold'); }, { passive: true });

  /* ---------- Esperanza: citas ---------- */
  var pick = ['Fabiola Martinez', 'Mayleen Wrieden (May)', 'JAIME V.H.', 'Marilin Pereia', 'Stefano Baroni', 'Marta Fernández'];
  var qs = pick.map(function (a) { return clean.filter(function (r) { return r.a === a; })[0]; }).filter(Boolean);
  var stage = $('#espStage');
  stage.innerHTML = qs.map(function (r) {
    return '<figure class="esp__q"><blockquote>' + esc(r.t).replace(/esperanza/gi, function (m) { return '<mark>' + m + '</mark>'; }) + '</blockquote><figcaption><span class="stars">★★★★★</span>' + esc(r.a) + ' · Google</figcaption></figure>';
  }).join('');
  var qEls = $$('.esp__q', stage), qi = 0, qT = 0, qDur = 7, qVisible = false, bar = $('#espBar'), cnt = $('#espCount');
  function showQ(n) {
    qEls[qi].classList.remove('on'); qEls[qi].classList.add('off');
    var old = qEls[qi]; setTimeout(function () { old.classList.remove('off'); }, 700);
    qi = (n + qEls.length) % qEls.length; qEls[qi].classList.add('on'); qT = 0;
    cnt.textContent = ('0' + (qi + 1)).slice(-2) + ' / ' + ('0' + qEls.length).slice(-2);
  }
  if (qEls.length) { qEls[0].classList.add('on'); cnt.textContent = '01 / ' + ('0' + qEls.length).slice(-2); }
  $('#espNext').addEventListener('click', function () { showQ(qi + 1); });
  $('#espPrev').addEventListener('click', function () { showQ(qi - 1); });
  new IntersectionObserver(function (es) { qVisible = es[0].isIntersecting; }, { threshold: 0.3 }).observe($('.esp__quotes'));
  var qLast = performance.now();
  (function qLoop(t) {
    var dt = (t - qLast) / 1000; qLast = t;
    if (qVisible && ANIM && qEls.length) { qT += dt; if (qT >= qDur) showQ(qi + 1); bar.style.transform = 'scaleX(' + Math.min(qT / qDur, 1) + ')'; }
    requestAnimationFrame(qLoop);
  })(qLast);
  var sx = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) { if (sx === null) return; var d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 40) showQ(qi + (d < 0 ? 1 : -1)); sx = null; });

  /* ---------- FAQ: apertura suave ---------- */
  $$('.faq details').forEach(function (d) {
    var s = $('summary', d), body = $('div', d);
    s.addEventListener('click', function (e) {
      if (!ANIM) return;
      e.preventDefault();
      if (d.open) {
        var h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)' }).onfinish = function () { d.open = false; };
      } else {
        d.open = true; var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.65,0,.35,1)' });
      }
    });
  });

  /* ---------- Lenis + GSAP (si cargan) ---------- */
  var lenis = null;
  function boot() {
    var win = $('#win'), ruler = $('.ruler__line');
    if (!ANIM || !window.gsap || !window.ScrollTrigger) { if (win) win.style.setProperty('--open', 1); return; }
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis && !TOUCH) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href'); if (id.length < 2) return;
          var t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -60, duration: 1.4 });
        });
      });
    }
    var mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', function () {
      gsap.to('.hero__main', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__arch', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__block', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
    // tarjetas apiladas: la anterior se hunde al llegar la siguiente
    var apts = $$('.apt');
    apts.forEach(function (a, i) {
      var next = apts[i + 1]; if (!next) return;
      gsap.to(a, { scale: 0.94, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 15%', scrub: true } });
    });
    // la ventana se abre
    gsap.fromTo(win, { '--open': 0 }, { '--open': 1, ease: 'none', scrollTrigger: { trigger: win, start: 'top 85%', end: 'center 45%', scrub: true } });
    gsap.fromTo(ruler, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: ruler, start: 'top 85%', end: 'bottom 55%', scrub: true } });
    gsap.from('.esp__mark', { yPercent: 40, rotate: -12, ease: 'none', scrollTrigger: { trigger: '.esp', start: 'top bottom', end: 'center center', scrub: true } });
    addEventListener('load', function () { ScrollTrigger.refresh(); measure(); });
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') boot();
  else addEventListener('DOMContentLoaded', boot);
})();
