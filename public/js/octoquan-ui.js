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

  function marquee() {
    const phrases = [
      'FUCK ICE',
      'LOVE THY NEIGHBOR',
      'SHOP LOCAL',
      'PUNCH A NAZI',
      "DEAD PEDOPHILES DON'T REOFFEND",
      'DIY OR DIE',
      'SAVOR THAT WHICH HAS NO FLAVOR',
      'MAKE SOME NOISE',
      'HIT THE QUAN!',
      'I <3 WOMEN!',
      'THE ONLY GOOD RAPIST IS A DEAD RAPIST',
      "DON'T BE AN ASSHOLE",
      "FUCK U IF U RACIST",
      "FUCK THE GOVERNMENT",
      "LOVE YOURSELF",
      "FORGIVENESS IS GOOD",
      "WAR IS MURDER",
      "I LOVE YOU",
      "THANKS FOR BEING YOU!",
      "SHED LIGHT ON TYRANNY",
      "THIS MACHINE KILLS FASCISTS",
      "STAY STRAPPED",
      "STAY WOKE",
      "TURN OFF THE BRAINROT",
      "ABOLISH INSIDER TRADING!",
      "TERM LIMITS FOR CONGRESSMEN!",
      "ABOLISH CORPORATE LOBBYING!",
      "LOBBYING = BRIBERY",
      "INJUSTICE FOR ONE IS INJUSTICE FOR ALL",
      "KEEP YOUR RELIGEON TO YOURSELF",
      "MAKE ABORTION SAFE AGAIN",
      "FUCK DONALD TRUMP",
      "FUCK JD VANCE",
      "FUCK SARAH HUCKABEE",
      "UNIONIZE!!!",
      "NAZI PUNKS FUCK OFF",
      "THE TWO-PARTY SYSTEM IS INHERENTLY ANTI-AMERICAN",
      "GODDAMN UNCLE SAM",
      "MALE INSECURITY IS AN EPIDEMIC",
      "FEMALE INSECURITY IS AN EPIDEMIC",
      "LOVE IS LOVE",
      "FUCK OFF ISRAEL",
      "MY TAXES, MY CHOICE!",
      "ABOLISH GERRYMANDERING!!!",
      "DON'T VOTE FOR FUCKHEADS",
      "YOU'RE BEAUTIFUL",
      "BE GOOD",
      "YOU'RE SO LOVELY",
      "AFROMAN IS AN AMERICAN HERO!"
    ];

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const phrase = phrases[seed % phrases.length];

    // Each repeated item is the phrase + padding on both sides (0 32px = ~64px total).
    // Monospace-ish uppercase text at 11px with letter-spacing 3px:
    // rough estimate is ~10px per character including spacing.
    // The track is duplicated (x2) for seamless looping — animation scrolls 50%.
    // We want a consistent pixels-per-second speed regardless of phrase length.
    const PX_PER_CHAR = 10;   // approximate px width per character at our font size
    const PADDING_PX  = 64;   // 32px each side per span
    const ITEMS       = 30;
    const SPEED       = 120;  // pixels per second — tune this to taste

    const singleItemWidth = phrase.length * PX_PER_CHAR + PADDING_PX;
    const halfTrackWidth  = singleItemWidth * ITEMS; // the 50% we animate across
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
          <a href="mailto:yiyam.music@gmail.com">Contact</a>
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
    if (!OctoquanDB.isReleased(release)) return ''; // upcoming uses countdown instead
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

  function injectShell(activePage) {
    document.body.insertAdjacentHTML('afterbegin', nav(activePage) + marquee());
    document.body.insertAdjacentHTML('beforeend', footer());
    initYear();
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
  };
})();