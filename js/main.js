/* ============================================================
   Coast and Country Roof Coatings — main.js
   Single IIFE. Behaviours wired per the rebuild spec.
   ============================================================ */
(function () {
  'use strict';

  console.info('Coast and Country · site script v2');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. Quote-fields template injection
  ---------------------------------------------------------- */
  const tpl = document.getElementById('quote-fields-template');
  if (tpl) {
    document.querySelectorAll('[data-inject-quote-fields]').forEach((form) => {
      form.appendChild(tpl.content.cloneNode(true));
    });
  }

  /* ----------------------------------------------------------
     2. Mobile menu open/close
  ---------------------------------------------------------- */
  const sheet = document.getElementById('mobile-sheet');
  const burger = document.querySelector('.nav-burger');
  const sheetClose = sheet && sheet.querySelector('.close');
  function openSheet() {
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (burger && sheet) burger.addEventListener('click', openSheet);
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);
  if (sheet) sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeSheet));

  /* ----------------------------------------------------------
     3. Header scroll-shadow (frosted while at top, solid + shadow on scroll)
  ---------------------------------------------------------- */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------
     4. Ticker speed normalisation (~60 px/s)
  ---------------------------------------------------------- */
  document.querySelectorAll('[data-ticker-track]').forEach((track) => {
    requestAnimationFrame(() => {
      const w = track.scrollWidth;
      const seconds = Math.max(30, Math.min(120, w / 60));
      track.style.animationDuration = seconds + 's';
    });
  });

  /* ----------------------------------------------------------
     5. Before/after slider drag — clip-path with cached rect
  ---------------------------------------------------------- */
  (function initBASlider() {
    const sliders = document.querySelectorAll('.ba-slider');
    if (!sliders.length) return;

    sliders.forEach(slider => {
      const after = slider.querySelector('.pane.after');
      const handle = slider.querySelector('.ba-handle, .handle');
      if (!after || !handle) return;

      let dragging = false;
      let rect = null;

      function setPos(clientX) {
        if (!rect) rect = slider.getBoundingClientRect();
        let pct = ((clientX - rect.left) / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        after.style.clipPath = `inset(0 0 0 ${pct}%)`;
        handle.style.left = pct + '%';
      }

      function onMove(e) {
        if (!dragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setPos(clientX);
        e.preventDefault();
      }

      function onDown(e) {
        dragging = true;
        rect = slider.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setPos(clientX);
      }

      function onUp() {
        dragging = false;
        rect = null;
      }

      // Initialize at 50%
      after.style.clipPath = 'inset(0 0 0 50%)';
      handle.style.left = '50%';

      slider.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);

      slider.addEventListener('touchstart', onDown, { passive: false });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    });
  })();

  /* ----------------------------------------------------------
     6. FAQ accordion (single-open)
  ---------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-item').forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ----------------------------------------------------------
     7. Areas accordion (open desktop, closed mobile)
  ---------------------------------------------------------- */
  const areas = document.querySelectorAll('details.areas-col');
  function syncAreas() {
    const mobile = window.matchMedia('(max-width: 720px)').matches;
    areas.forEach((d) => { d.open = !mobile; });
  }
  syncAreas();
  window.addEventListener('resize', syncAreas);

  /* ----------------------------------------------------------
     8. Counter tween helper
  ---------------------------------------------------------- */
  function tweenCount(el, target, dur, prefix, suffix) {
    prefix = prefix || '';
    suffix = suffix || '';
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------
     9. Stats strip counters (on viewport entry)
  ---------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const statsIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('[data-stat]').forEach((el) => {
            const target = parseInt(el.dataset.countTo || '0', 10);
            const prefix = el.dataset.prefix || '';
            const suffix = el.dataset.suffix || '';
            tweenCount(el, target, 1200, prefix, suffix);
          });
          statsIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-stats]').forEach((s) => statsIo.observe(s));
  }

  /* ----------------------------------------------------------
     10. Guarantee gauge SVG arc + number tween
  ---------------------------------------------------------- */
  const gauge = document.querySelector('.guarantee-gauge');
  if (gauge && 'IntersectionObserver' in window) {
    const arc = gauge.querySelector('.gauge-arc');
    const num = gauge.querySelector('.gauge-num');
    const target = parseInt(num.dataset.countTo || '10', 10);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (arc) arc.classList.add('is-animating');
          if (num) tweenCount(num, target, 1400, '', '');
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(gauge);
  }

  /* ----------------------------------------------------------
     11. Scroll reveal + stagger
  ---------------------------------------------------------- */
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('is-visible'), i * 80);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  /* ----------------------------------------------------------
     12. Gallery constant drift + prev/next arrow navigation
  ---------------------------------------------------------- */
  const gallery = document.querySelector('[data-gallery]');
  const galleryTrack = document.querySelector('[data-gallery-track]');
  const galleryPrev = document.querySelector('[data-gallery-prev]');
  const galleryNext = document.querySelector('[data-gallery-next]');
  if (gallery && galleryTrack) {
    const tiles = Array.from(galleryTrack.children);
    if (tiles.length) {
      tiles.forEach((t) => galleryTrack.appendChild(t.cloneNode(true)));
      let pos = 0;
      let paused = false;
      const speed = 0.35;
      function step() {
        if (!paused) {
          pos -= speed;
          const half = galleryTrack.scrollWidth / 2;
          if (-pos >= half) pos = 0;
          galleryTrack.style.transform = `translateX(${pos}px)`;
        }
        requestAnimationFrame(step);
      }
      gallery.addEventListener('mouseenter', () => { paused = true; });
      gallery.addEventListener('mouseleave', () => { paused = false; });
      requestAnimationFrame(step);

      // Arrow controls — pause drift, shift one tile width, idle-resume after 4s
      let idleTimer = null;
      function bumpIdle() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { paused = false; }, 4000);
      }
      function tileStep() {
        const tile = tiles[0];
        if (!tile) return 280;
        return tile.getBoundingClientRect().width + 14;
      }
      function shift(direction) {
        paused = true;
        const half = galleryTrack.scrollWidth / 2;
        pos += direction * tileStep();
        // Wrap around to keep the loop seamless
        if (pos > 0) pos -= half;
        if (-pos >= half) pos += half;
        galleryTrack.style.transform = `translateX(${pos}px)`;
        bumpIdle();
      }
      if (galleryPrev) galleryPrev.addEventListener('click', () => shift(1));
      if (galleryNext) galleryNext.addEventListener('click', () => shift(-1));
    }
  }

  /* ----------------------------------------------------------
     13. Before/after carousel (4 slides + dot nav)
  ---------------------------------------------------------- */
  const baCarousel = document.querySelector('[data-ba-carousel]');
  const baTrack = baCarousel && baCarousel.querySelector('[data-ba-track]');
  if (baCarousel && baTrack) {
    const items = Array.from(baTrack.children);
    const dots = Array.from(baCarousel.querySelectorAll('[data-ba-jump]'));
    let active = 0;
    function setActive(i) {
      active = (i + items.length) % items.length;
      baTrack.style.transform = `translateX(${-active * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('is-active', di === active));
    }
    dots.forEach((d, di) => d.addEventListener('click', () => setActive(di)));
    setActive(0);
  }

  /* ----------------------------------------------------------
     14. Reviews carousel (scroll-snap + arrows + dots + auto-advance)
  ---------------------------------------------------------- */
  const reviews = document.querySelector('[data-reviews]');
  const reviewsTrack = document.querySelector('[data-reviews-track]');
  if (reviews && reviewsTrack) {
    const cards = Array.from(reviewsTrack.children);
    const dots = Array.from(document.querySelectorAll('[data-reviews-jump]'));
    const prev = document.querySelector('[data-reviews-prev]');
    const next = document.querySelector('[data-reviews-next]');
    let active = 0;
    let auto = null;

    function cardStep() {
      const first = cards[0];
      if (!first) return 0;
      const styles = getComputedStyle(reviewsTrack);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return first.getBoundingClientRect().width + gap;
    }
    function syncFromScroll() {
      const step = cardStep();
      if (!step) return;
      const idx = Math.round(reviewsTrack.scrollLeft / step);
      active = Math.max(0, Math.min(cards.length - 1, idx));
      dots.forEach((d, di) => d.classList.toggle('is-active', di === active));
    }
    function jumpTo(i) {
      active = (i + cards.length) % cards.length;
      reviewsTrack.scrollTo({ left: active * cardStep(), behavior: 'smooth' });
      dots.forEach((d, di) => d.classList.toggle('is-active', di === active));
    }
    if (prev) prev.addEventListener('click', () => jumpTo(active - 1));
    if (next) next.addEventListener('click', () => jumpTo(active + 1));
    dots.forEach((d, di) => d.addEventListener('click', () => jumpTo(di)));

    let scrollT = null;
    reviewsTrack.addEventListener('scroll', () => {
      if (scrollT) clearTimeout(scrollT);
      scrollT = setTimeout(syncFromScroll, 80);
    }, { passive: true });

    function startAuto() {
      stopAuto();
      auto = setInterval(() => {
        const step = cardStep();
        const max = reviewsTrack.scrollWidth - reviewsTrack.clientWidth;
        if (reviewsTrack.scrollLeft >= max - 4) jumpTo(0);
        else jumpTo(active + 1);
      }, 5000);
    }
    function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
    reviews.addEventListener('mouseenter', stopAuto);
    reviews.addEventListener('mouseleave', startAuto);
    if (!reduced) startAuto();
    window.addEventListener('resize', syncFromScroll);
  }

  /* ----------------------------------------------------------
     14b. (Common Roof Problems is now a CSS-only marquee.
          See .problems-marquee + @keyframes problems-drift in main.css.)
  ---------------------------------------------------------- */

  /* ----------------------------------------------------------
     15. Colour guide expand/collapse (height + opacity)
  ---------------------------------------------------------- */
  const cToggle = document.querySelector('[data-colour-toggle]');
  const cExtra  = document.querySelector('[data-colour-extra]');
  const cLabel  = document.querySelector('[data-toggle-label]');
  if (cToggle && cExtra) {
    cToggle.addEventListener('click', () => {
      const isOpen = cExtra.classList.contains('is-open');
      if (isOpen) {
        cExtra.classList.remove('is-open');
        cToggle.setAttribute('aria-expanded', 'false');
        if (cLabel) cLabel.textContent = 'View All 22 Colours';
        setTimeout(() => { cExtra.setAttribute('hidden', ''); }, 350);
      } else {
        cExtra.removeAttribute('hidden');
        // Force reflow before applying transition
        void cExtra.offsetWidth;
        cExtra.classList.add('is-open');
        cToggle.setAttribute('aria-expanded', 'true');
        if (cLabel) cLabel.textContent = 'Show Fewer';
      }
    });
  }

  /* ----------------------------------------------------------
     16. Smooth scroll for anchor links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ----------------------------------------------------------
     17. File dropzone (drag/drop + previews + validation)
  ---------------------------------------------------------- */
  document.querySelectorAll('[data-dropzone]').forEach((zone) => {
    const input = zone.querySelector('[data-file-input]');
    const previews = zone.parentElement.querySelector('[data-dropzone-previews]');
    const errBox = zone.parentElement.querySelector('[data-dropzone-error]');
    function showErr(msg) {
      if (!errBox) return;
      errBox.textContent = msg;
      errBox.hidden = false;
      setTimeout(() => { errBox.hidden = true; }, 4000);
    }
    function addFiles(files) {
      Array.from(files).slice(0, 5).forEach((file) => {
        if (!file.type.startsWith('image/')) return showErr('Photos only.');
        if (file.size > 10 * 1024 * 1024) return showErr('Each photo must be under 10MB.');
        const url = URL.createObjectURL(file);
        const div = document.createElement('div');
        div.className = 'dropzone-thumb';
        div.innerHTML = `<img src="${url}" alt=""><button type="button" aria-label="Remove">&times;</button>`;
        div.querySelector('button').addEventListener('click', (e) => {
          e.preventDefault();
          div.remove();
        });
        previews && previews.appendChild(div);
      });
    }
    if (input) input.addEventListener('change', (e) => addFiles(e.target.files));
    ['dragenter', 'dragover'].forEach((ev) => {
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('is-drag'); });
    });
    ['dragleave', 'drop'].forEach((ev) => {
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('is-drag'); });
    });
    zone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  });

  /* ----------------------------------------------------------
     18. Year auto-update in footer
  ---------------------------------------------------------- */
  const y = document.getElementById('current-year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------
     19. Video error fallback (swap to poster image)
  ---------------------------------------------------------- */
  document.querySelectorAll('video.media-video').forEach((v) => {
    function fallback() {
      const poster = v.getAttribute('poster');
      if (!poster) return;
      const img = document.createElement('img');
      img.src = poster;
      img.alt = '';
      img.className = 'media-video';
      v.replaceWith(img);
    }
    v.addEventListener('error', fallback, true);
    v.querySelectorAll('source').forEach((s) => s.addEventListener('error', fallback));
    // After a short delay, if no readyState, swap to poster
    setTimeout(() => {
      if (v.isConnected && v.readyState === 0 && v.networkState === 3) fallback();
    }, 2500);
  });

  /* ----------------------------------------------------------
     20. Image error fallback (placeholder stripes)
  ---------------------------------------------------------- */
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = '1';
      const div = document.createElement('div');
      div.className = 'placeholder-stripes';
      div.style.aspectRatio = (img.width && img.height) ? (img.width + '/' + img.height) : '4/3';
      div.innerHTML = '<span class="ph-label">[ IMAGE — TO BE ADDED ]</span>';
      img.replaceWith(div);
    });
  });

  /* ----------------------------------------------------------
     21. Quote modal (with data-service / data-colour pre-fill)
  ---------------------------------------------------------- */
  const modal = document.getElementById('quote-modal');
  function openModal(opts) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const colourField  = modal.querySelector('[data-modal-colour]');
    const serviceField = modal.querySelector('[data-modal-service]');
    if (colourField)  colourField.value  = (opts && opts.colour)  || '';
    if (serviceField) serviceField.value = (opts && opts.service) || '';
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('[data-open-quote]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal({
        colour:  btn.dataset.colour  || '',
        service: btn.dataset.service || ''
      });
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach((btn) => btn.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeLead(); } });

  /* ----------------------------------------------------------
     22. Lead-capture popup (15s + exit-intent + 55% scroll)
  ---------------------------------------------------------- */
  const lead = document.getElementById('lead-popup');
  let leadShown = false;
  function openLead() {
    if (!lead || leadShown) return;
    if (sessionStorage.getItem('cc-lead-shown')) return;
    leadShown = true;
    sessionStorage.setItem('cc-lead-shown', '1');
    lead.classList.add('is-open');
    lead.setAttribute('aria-hidden', 'false');
  }
  function closeLead() {
    if (!lead) return;
    lead.classList.remove('is-open');
    lead.setAttribute('aria-hidden', 'true');
  }
  if (lead) {
    setTimeout(openLead, 15000);
    document.addEventListener('mouseleave', (e) => { if (e.clientY <= 0) openLead(); });
    document.addEventListener('scroll', () => {
      const max = document.body.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.55) openLead();
    }, { passive: true });
    lead.querySelectorAll('[data-lead-close]').forEach((b) => b.addEventListener('click', closeLead));
  }

  /* ----------------------------------------------------------
     23. Hero cursor parallax (desktop only, subtle)
  ---------------------------------------------------------- */
  const heroContent = document.querySelector('[data-hero-content]');
  if (heroContent && !reduced && window.matchMedia('(min-width: 960px)').matches) {
    const hero = document.querySelector('[data-hero]');
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        heroContent.style.transform = `translate3d(${(-cx * 4).toFixed(2)}px, ${(-cy * 4).toFixed(2)}px, 0)`;
      });
      hero.addEventListener('mouseleave', () => {
        heroContent.style.transform = '';
      });
    }
  }

  /* ----------------------------------------------------------
     24. Hero image resolution warning (dev hint)
  ---------------------------------------------------------- */
  const heroImg = document.querySelector('.hero-bg');
  if (heroImg) {
    heroImg.addEventListener('load', () => {
      if (heroImg.naturalWidth < 1600) {
        console.warn('Coast and Country: hero image <1600px wide — supply a larger source for sharper rendering.');
      }
    });
  }

  /* ----------------------------------------------------------
     25. Headline word-stagger reveal on scroll
  ---------------------------------------------------------- */
  (function initHeadlineReveal() {
    const headlines = document.querySelectorAll('.section-head h2');
    if (!headlines.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    headlines.forEach(h => {
      const text = h.textContent.trim();
      const words = text.split(/\s+/);
      h.innerHTML = words.map(w => `<span class="word-reveal">${w}</span>`).join(' ');
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const ws = entry.target.querySelectorAll('.word-reveal');
          ws.forEach((w, i) => setTimeout(() => w.classList.add('is-in'), i * 80));
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    headlines.forEach(h => io.observe(h));
  })();

  /* ----------------------------------------------------------
     26. Image scale-in on viewport entry
  ---------------------------------------------------------- */
  (function initImageReveal() {
    const targets = document.querySelectorAll(
      '.gallery-tile img, .ba-slider .pane img, .process-step .process-step-img img, .gallery-track img'
    );
    if (!targets.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    targets.forEach(img => img.classList.add('image-reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    targets.forEach(img => io.observe(img));
  })();

  /* ----------------------------------------------------------
     27. CTA magnetic hover (desktop only)
  ---------------------------------------------------------- */
  (function initCTAMagnet() {
    if (window.matchMedia('(max-width: 720px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctas = document.querySelectorAll('.btn-primary, .phone-pill');
    if (!ctas.length) return;

    ctas.forEach(btn => {
      let raf = null;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.18;
        const dy = (e.clientY - cy) * 0.18;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });
      });
      btn.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        btn.style.transform = '';
      });
    });
  })();

  /* ----------------------------------------------------------
     28. Sticky credential micro-bar (desktop only)
  ---------------------------------------------------------- */
  (function initStickyCreds() {
    const bar = document.getElementById('sticky-creds');
    const hero = document.querySelector('.hero');
    if (!bar || !hero) return;
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          bar.classList.add('is-visible');
          bar.setAttribute('aria-hidden', 'false');
        } else {
          bar.classList.remove('is-visible');
          bar.setAttribute('aria-hidden', 'true');
        }
      });
    }, { threshold: 0.05 });

    io.observe(hero);
  })();

})();
