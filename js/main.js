/* ============================================================
   Coast and Country Roof Coatings — main.js
   Single IIFE implementing the 21 behaviours from spec §14.
   ============================================================ */
(function () {
  'use strict';

  console.info('Coast and Country · site script v1');

  /* 1. Hero image resolution warning -------------------------- */
  const heroImg = document.querySelector('.hero-bg');
  if (heroImg) {
    heroImg.addEventListener('load', () => {
      if (heroImg.naturalWidth < 1600) {
        console.warn('Coast and Country: hero image <1600px wide — supply a larger source for sharper rendering.');
      }
    });
  }

  /* 2. Quote-fields template injection ----------------------- */
  const tpl = document.getElementById('quote-fields-template');
  if (tpl) {
    document.querySelectorAll('[data-inject-quote-fields]').forEach((form) => {
      const frag = tpl.content.cloneNode(true);
      form.appendChild(frag);
    });
  }

  /* 3. Mobile menu open/close -------------------------------- */
  const sheet = document.getElementById('mobile-sheet');
  const burger = document.querySelector('.nav-burger');
  const sheetClose = sheet && sheet.querySelector('.close');
  function openSheet() { sheet.classList.add('is-open'); sheet.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeSheet() { sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  if (burger && sheet) burger.addEventListener('click', openSheet);
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);
  if (sheet) sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeSheet));

  /* 4. Header scroll-shadow --------------------------------- */
  const header = document.getElementById('site-header') || document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* 5. Ticker speed normalisation --------------------------- */
  document.querySelectorAll('[data-ticker-track]').forEach((track) => {
    requestAnimationFrame(() => {
      const w = track.scrollWidth;
      const seconds = Math.max(30, Math.min(90, w / 80));
      track.style.animationDuration = seconds + 's';
    });
  });

  /* 6. Before/after slider drag ----------------------------- */
  document.querySelectorAll('.ba-slider').forEach((slider) => {
    const after = slider.querySelector('.pane.after');
    const handle = slider.querySelector('.handle');
    let dragging = false;
    function setPos(clientX) {
      const r = slider.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      const pct = (x * 100).toFixed(2);
      if (after) after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      if (handle) handle.style.left = pct + '%';
    }
    const start = (e) => {
      dragging = true;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(cx);
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(cx);
    };
    const end = () => { dragging = false; };
    slider.addEventListener('mousedown', start);
    slider.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
  });

  /* 7. FAQ accordion (single-open) -------------------------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-item').forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* 8. Areas accordion (open desktop, closed mobile) -------- */
  const areas = document.querySelectorAll('details.areas-col');
  function syncAreas() {
    const mobile = window.matchMedia('(max-width: 720px)').matches;
    areas.forEach((d) => { d.open = !mobile; });
  }
  syncAreas();
  window.addEventListener('resize', syncAreas);

  /* 9. Scroll reveal + stagger ------------------------------ */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  /* 10. Counter tween + 11. Gauge animation ----------------- */
  function tweenCount(el, target, dur) {
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(eased * target);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  const gauge = document.querySelector('.guarantee-gauge');
  if (gauge && 'IntersectionObserver' in window) {
    const arc = gauge.querySelector('.gauge-arc');
    const num = gauge.querySelector('.gauge-num');
    const target = parseInt(num.dataset.countTo || '10', 10);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (arc) arc.classList.add('is-animating');
          if (num) tweenCount(num, target, 1600);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(gauge);
  }

  /* 12. Gallery constant drift + dot navigation ------------- */
  const gallery = document.querySelector('[data-gallery]');
  const galleryTrack = document.querySelector('[data-gallery-track]');
  const galleryDotsHost = document.querySelector('[data-gallery-dots]');
  if (gallery && galleryTrack) {
    const tiles = Array.from(galleryTrack.children);
    if (tiles.length) {
      // Duplicate tiles for seamless loop
      tiles.forEach((t) => galleryTrack.appendChild(t.cloneNode(true)));
      // Build dots = number of original tiles
      if (galleryDotsHost) {
        tiles.forEach((_, i) => {
          const b = document.createElement('button');
          b.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
          b.setAttribute('aria-label', 'Go to gallery item ' + (i + 1));
          b.addEventListener('click', () => jumpTo(i));
          galleryDotsHost.appendChild(b);
        });
      }
      let pos = 0;
      let paused = false;
      const speed = 0.35; // px/frame
      function step() {
        if (!paused) {
          pos -= speed;
          const half = galleryTrack.scrollWidth / 2;
          if (-pos >= half) pos = 0;
          galleryTrack.style.transform = `translateX(${pos}px)`;
          updateActiveDot();
        }
        requestAnimationFrame(step);
      }
      function updateActiveDot() {
        if (!galleryDotsHost) return;
        const tile = tiles[0];
        if (!tile) return;
        const tw = tile.getBoundingClientRect().width + 16;
        const idx = Math.round(Math.abs(pos) / tw) % tiles.length;
        galleryDotsHost.querySelectorAll('.gallery-dot').forEach((d, i) => {
          d.classList.toggle('is-active', i === idx);
        });
      }
      function jumpTo(idx) {
        const tile = tiles[0];
        if (!tile) return;
        const tw = tile.getBoundingClientRect().width + 16;
        pos = -tw * idx;
        galleryTrack.style.transform = `translateX(${pos}px)`;
        updateActiveDot();
      }
      gallery.addEventListener('mouseenter', () => { paused = true; });
      gallery.addEventListener('mouseleave', () => { paused = false; });
      requestAnimationFrame(step);
    }
  }

  /* 13. Reviews carousel ----------------------------------- */
  const reviews = document.querySelector('[data-reviews]');
  const reviewsTrack = document.querySelector('[data-reviews-track]');
  if (reviews && reviewsTrack) {
    const cards = Array.from(reviewsTrack.children);
    const dots = Array.from(document.querySelectorAll('[data-reviews-jump]'));
    const prev = document.querySelector('[data-reviews-prev]');
    const next = document.querySelector('[data-reviews-next]');
    let active = 0;
    const isMobile = () => window.matchMedia('(max-width: 960px)').matches;
    function setActive(i) {
      active = (i + cards.length) % cards.length;
      dots.forEach((d, di) => d.classList.toggle('is-active', di === active));
      if (isMobile()) {
        cards.forEach((c, ci) => { c.style.display = ci === active ? '' : 'none'; });
      } else {
        cards.forEach((c) => { c.style.display = ''; });
      }
    }
    if (prev) prev.addEventListener('click', () => setActive(active - 1));
    if (next) next.addEventListener('click', () => setActive(active + 1));
    dots.forEach((d, di) => d.addEventListener('click', () => setActive(di)));
    window.addEventListener('resize', () => setActive(active));
    setActive(0);
  }

  /* 14. Colour guide expand/collapse ----------------------- */
  const cToggle = document.querySelector('[data-colour-toggle]');
  const cExtra  = document.querySelector('[data-colour-extra]');
  const cLabel  = document.querySelector('[data-toggle-label]');
  if (cToggle && cExtra) {
    cToggle.addEventListener('click', () => {
      const open = cExtra.hasAttribute('hidden') ? false : true;
      if (open) {
        cExtra.setAttribute('hidden', '');
        cToggle.setAttribute('aria-expanded', 'false');
        if (cLabel) cLabel.textContent = 'View All 22 Colours';
      } else {
        cExtra.removeAttribute('hidden');
        cToggle.setAttribute('aria-expanded', 'true');
        if (cLabel) cLabel.textContent = 'Show Fewer';
      }
    });
  }

  /* 15. Smooth scroll for anchors -------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* 16. File dropzone -------------------------------------- */
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
        div.innerHTML = `<img src="${url}" alt=""><button type="button" aria-label="Remove">×</button>`;
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

  /* 17. Year auto-update ----------------------------------- */
  const y = document.getElementById('current-year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* 18. Video autoplay + fallback poster ------------------- */
  document.querySelectorAll('video.media-video').forEach((v) => {
    v.addEventListener('error', () => {
      const poster = v.getAttribute('poster');
      if (poster) {
        const img = document.createElement('img');
        img.src = poster;
        img.alt = '';
        img.className = 'media-video';
        v.replaceWith(img);
      }
    });
  });

  /* 19. Image fallback ------------------------------------- */
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

  /* 20. Quote modal ---------------------------------------- */
  const modal = document.getElementById('quote-modal');
  function openModal(colour) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (colour) {
      const inp = modal.querySelector('[data-modal-colour]');
      if (inp) inp.value = colour;
    }
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
      const colour = btn.dataset.colour || '';
      openModal(colour);
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach((btn) => btn.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeLead(); } });

  /* 21. Lead-capture popup --------------------------------- */
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

})();
