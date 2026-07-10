/**
 * OctoquanUI
 * Shared HTML components used across all pages.
 */

const OctoquanUI = (() => {

  // Labels for release streaming links
  const STREAM_LABELS = {
    spotify:    'Spotify',
    apple:      'Apple Music',
    amazon:     'Amazon Music',
    pandora:    'Pandora',
    youtube:    'YouTube',
    soundcloud: 'SoundCloud',
    bandcamp:   'Bandcamp',
    tidal:      'Tidal',
    qobuz:      'Qobuz',
  };

  // Labels for artist profile links
  const LINK_LABELS = {
    spotify:    'Spotify',
    apple:      'Apple Music',
    amazon:     'Amazon Music',
    pandora:    'Pandora',
    youtube:    'YouTube',
    soundcloud: 'SoundCloud',
    bandcamp:   'Bandcamp',
    qobuz:      'Qobuz',
    instagram:  'Instagram',
  };

  function nav(activePage = '') {
    const links = [
      { slug: 'news',     label: 'News', href: 'https://theonion.com' },
      { slug: 'artists',  label: 'Artists' },
      { slug: 'releases', label: 'Releases' },
      { slug: 'shows',    label: 'Shows' },
      //{ slug: 'store',    label: 'Store' },
      { slug: 'about',    label: 'About' },
      //{ slug: 'services', label: 'Services' },  // hidden while under development
      { slug: 'demos', label: 'Demo Submissions', href: 'https://forms.gle/iCZnsLzhUg596hiT8' },
    ];
    return `
      <header>
        <nav class="nav" aria-label="Primary">
          <a class="brand" href="/" aria-label="Octoquan Records home">
            <img class="logo" src="/assets/images/logos/octoquan.png" alt="Octoquan logo" />
            <span class="namewrap">
              <span class="name">octoquan</span>
              <span class="tag">records</span>
            </span>
          </a>
          <div class="navlinks">
            ${links.map(l => `<a class="pill${activePage === l.slug ? ' active' : ''}" href="${l.href || '/' + l.slug}"${l.href ? ' target="_blank" rel="noopener"' : ''}>${l.label}</a>`).join('')}
          </div>
        </nav>
      </header>`;
  }

  function setMeta({ title, description, keywords } = {}) {
    if (title) document.title = title;
    if (description) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) { el = document.createElement('meta'); el.name = 'description'; document.head.appendChild(el); }
      el.content = description;
    }
    if (keywords) {
      let el = document.querySelector('meta[name="keywords"]');
      if (!el) { el = document.createElement('meta'); el.name = 'keywords'; document.head.appendChild(el); }
      el.content = keywords;
    }
  }

  function marquee() {
    const phrases = [
      //nice words, good vibes
        'LOVE THY NEIGHBOR',
        'SHOP LOCAL',
        'SAVOR THAT WHICH HAS NO FLAVOR',
        'MAKE SOME NOISE',
        'HIT THE QUAN!',
        'I <3 WOMEN!',
        "LOVE URSELF",
        "FORGIVENESS IS GOOD",
        "I LOVE U!",
        "THANKS FOR BEING YOU!",
        "TURN OFF THE BRAINROT",
        "LOVE IS LOVE",
        "YOU'RE BEAUTIFUL",
        "BE GOOD",
        "YOU'RE SO LOVELY",
        "SPREAD KINDNESS",
        "BE THE CHANGE YOU WANT TO SEE",
        "STAY SMART",
        "STAY IN SCHOOL",
        "READ BOOKS",
        "SUPPORT LOCAL ARTISTS",
        "DON'T DO DRUGS, KIDS",
        "EAT YOUR VEGGIES"
    ];

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const phrase = phrases[seed % phrases.length];

    const PX_PER_CHAR = 10;
    const PADDING_PX  = 64;
    const ITEMS       = 30;
    const SPEED       = 120;

    const singleItemWidth = phrase.length * PX_PER_CHAR + PADDING_PX;
    const halfTrackWidth  = singleItemWidth * ITEMS;
    const duration        = Math.round(halfTrackWidth / SPEED);

    const items = Array(ITEMS).fill(phrase)
      .map((t, i) => `<span${i > 0 ? ' class="dot"' : ''}>${t}</span>`).join('');

    return `
      <div class="marquee-wrap" aria-hidden="true">
        <div class="marquee-track" style="animation-duration:${duration}s">${items}</div>
      </div>`;
  }

  function footer() {
    return `
      <footer>
        <div class="footer-inner">
          <p class="footer-copy">© Octoquan Records <span id="year"></span> · Arkansas, USA</p>
          <div class="footer-links">
            <a href="/about">About</a>
            <a href="https://forms.gle/iCZnsLzhUg596hiT8" target="_blank" rel="noopener">Demos</a>
            <a href="mailto:info@octoquan.com">Contact</a>
          </div>
        </div>
      </footer>`;
  }

  // Stream buttons — suppressed for upcoming releases.
  function streamButtons(streaming, release) {
    if (release && !OctoquanDB.isReleased(release)) return '';
    return Object.entries(streaming)
      .filter(([, url]) => url)
      .map(([k, url]) => `<a class="stream-btn" href="${url}" target="_blank" rel="noopener">↗ ${STREAM_LABELS[k] || k}</a>`)
      .join('');
  }

  function socialButtons(links) {
    return Object.entries(links)
      .filter(([, url]) => url)
      .map(([k, url]) => `<a class="stream-btn" href="${url}" target="_blank" rel="noopener">↗ ${LINK_LABELS[k] || k}</a>`)
      .join('');
  }

  // Returns an "Upcoming" badge span, or empty string if already released.
  function upcomingBadge(release) {
    if (OctoquanDB.isReleased(release)) return '';
    return `<span class="upcoming-badge">Upcoming</span>`;
  }

  // Returns a "Released Month Day, Year" line for released releases, or empty string.
  function releaseDateLine(release) {
    if (!OctoquanDB.isReleased(release)) return '';
    const formatted = OctoquanDB.formatReleaseDate(release.releaseDate);
    if (!formatted) return '';
    return `<p class="release-date-line">Released ${formatted}</p>`;
  }

  // Returns a countdown timer block for upcoming releases.
  function countdownTimer(release) {
    if (!release.releaseDate || OctoquanDB.isReleased(release)) return '';

    const timerId = `countdown-${release.releaseId ?? release.slug}`;
    const targetDate = new Date(release.releaseDate + 'T00:00:00');
    const formatted = OctoquanDB.formatReleaseDate(release.releaseDate);

    setTimeout(() => {
      const el = document.getElementById(timerId);
      if (!el) return;

      function tick() {
        const now  = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
          el.innerHTML = `<span class="countdown-label">Out now</span>`;
          return;
        }

        const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        el.innerHTML = `
          <span class="countdown-label">Out ${formatted}</span>
          <div class="countdown-units">
            <div class="countdown-unit"><span class="countdown-num">${String(days).padStart(2, '0')}</span><span class="countdown-unit-label">days</span></div>
            <div class="countdown-sep">:</div>
            <div class="countdown-unit"><span class="countdown-num">${String(hours).padStart(2, '0')}</span><span class="countdown-unit-label">hrs</span></div>
            <div class="countdown-sep">:</div>
            <div class="countdown-unit"><span class="countdown-num">${String(minutes).padStart(2, '0')}</span><span class="countdown-unit-label">min</span></div>
            <div class="countdown-sep">:</div>
            <div class="countdown-unit"><span class="countdown-num">${String(seconds).padStart(2, '0')}</span><span class="countdown-unit-label">sec</span></div>
          </div>`;
      }

      tick();
      setInterval(tick, 1000);
    }, 0);

    return `<div class="countdown-timer" id="${timerId}"></div>`;
  }

  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  function initParallax() {
    const img = document.createElement('img');
    img.className = 'parallax-bg';
    img.id = 'parallax-bg';
    img.src = '/assets/images/logos/superquan.png';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(img, document.body.firstChild);

    const isMobile = () => window.innerWidth <= 768;

    function update() {
      if (isMobile()) {
        img.style.transform = 'none';
        return;
      }
      const scrollY   = Math.max(0, window.scrollY);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress  = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      const imgHeight = img.offsetWidth; // height is set to 100vw
      const travel    = Math.max(0, imgHeight - window.innerHeight);
      img.style.transform = `translate3d(0, ${-progress * travel}px, 0)`;
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    if (img.complete) { update(); }
    else { img.addEventListener('load', update); }
  }

  function injectShell(activePage) {
    document.body.insertAdjacentHTML('afterbegin', nav(activePage) + marquee());
    document.body.insertAdjacentHTML('beforeend', footer());
    initYear();
    initParallax();
  }

  return {
    nav,
    marquee,
    footer,
    streamButtons,
    socialButtons,
    upcomingBadge,
    releaseDateLine,
    countdownTimer,
    injectShell,
    initYear,
    setMeta,
  };
})();
