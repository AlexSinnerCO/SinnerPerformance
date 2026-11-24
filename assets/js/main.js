(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');

  // Menü auf dem Handy
  var toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) toggle.click();
    });
  }

  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Raster und Listen: Elemente nacheinander einblenden statt alle auf einmal
  if (!calm) {
    ['.tiles', '.faq', '.checklist', '.spec'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (box) {
        box.classList.remove('reveal');
        Array.prototype.forEach.call(box.children, function (child, i) {
          child.classList.add('reveal');
          child.style.setProperty('--i', i);
        });
      });
    });
    ['.cards', '.steps', '.principles', '.facts ul'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (box) {
        Array.prototype.forEach.call(box.querySelectorAll(':scope > .reveal'), function (child, i) {
          child.style.setProperty('--i', i);
        });
      });
    });
    document.querySelectorAll('.cta').forEach(function (c) { c.classList.add('reveal-self'); });
  }

  // Bilder frühzeitig laden: etwa eine Bildschirmhöhe bevor sie sichtbar werden
  // (Safari wartet bei loading="lazy" sonst bis kurz vor dem Rand)
  if ('IntersectionObserver' in window) {
    var early = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.loading = 'eager';
          early.unobserve(entry.target);
        }
      });
    }, { rootMargin: '2000px 0px' });
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) { early.observe(img); });
  }

  // Sobald die Seite fertig ist: restliche Bilder nacheinander im Hintergrund vorladen,
  // damit sie beim Scrollen schon da sind (stört den Seitenaufbau nicht)
  window.addEventListener('load', function () {
    var rest = Array.prototype.filter.call(document.querySelectorAll('img[loading="lazy"]'), function (img) { return !img.complete; });
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 200); };
    var next = function () {
      var img = rest.shift();
      if (!img) return;
      if (img.complete) { next(); return; }
      img.addEventListener('load', function () { idle(next); }, { once: true });
      img.addEventListener('error', function () { idle(next); }, { once: true });
      img.loading = 'eager';
    };
    idle(next);
  });

  // Sanftes Einblenden beim Scrollen
  var items = document.querySelectorAll('.reveal, .reveal-self');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.classList.add('is-in');
          io.unobserve(el);
          // Verzögerung danach entfernen, damit Hover-Effekte sofort reagieren
          setTimeout(function () { el.style.removeProperty('--i'); }, 1600);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // "Anderes Modell" / "Etwas anderes": Zusatzfeld zum Reinschreiben einblenden
  document.querySelectorAll('select[data-other]').forEach(function (select) {
    var input = document.getElementById(select.getAttribute('data-other'));
    if (!input) return;
    var wrap = input.parentElement;
    var update = function (focus) {
      var last = select.options[select.options.length - 1];
      var isOther = select.value !== '' && select.value === last.value;
      wrap.hidden = !isOther;
      input.required = isOther;
      if (!isOther) input.value = '';
      if (isOther && focus) input.focus();
    };
    select.addEventListener('change', function () { update(true); });
    update(false);
  });

  // Rückmeldung nach dem Absenden des Formulars
  var status = document.getElementById('form-status');
  if (status) {
    var params = new URLSearchParams(window.location.search);
    var s = params.get('status');
    var messages = {
      ok: ['ok', 'Danke, deine Anfrage ist angekommen. Wir melden uns in der Regel innerhalb von einem Werktag bei dir.'],
      fehler: ['error', 'Da hat etwas nicht geklappt. Bitte prüf deine Angaben oder ruf uns direkt an: 0178 6329983.'],
      warten: ['error', 'Du hast gerade schon eine Anfrage geschickt. Bitte warte ein paar Minuten, bevor du es noch einmal versuchst.']
    };
    if (messages[s]) {
      status.textContent = messages[s][1];
      status.classList.add('is-visible', 'form-status--' + messages[s][0]);
      status.setAttribute('tabindex', '-1');
      status.focus();
    }
  }

  // Fortschrittslinie unter der Kopfzeile, wächst beim Scrollen mit
  var header = document.querySelector('.site-header');
  if (header && !calm) {
    var line = document.createElement('span');
    line.className = 'scroll-progress';
    line.setAttribute('aria-hidden', 'true');
    header.appendChild(line);
    var ticking = false;
    var draw = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      line.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(draw); }
    }, { passive: true });
    draw();
  }

  // Handy: feste Anfrage-Leiste erst nach etwas Scrollen zeigen
  var bar = document.querySelector('.mobile-cta');
  if (bar) {
    var onScroll = function () { bar.classList.toggle('is-visible', window.scrollY > 480); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Jahreszahl in der Fußzeile
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
