/**
 * render-release-page.js
 * Renders the full release page: hero + tracklist.
 * Used on: /artists/[slug]/[release]/index.html
 *
 * Same override pattern as render-artist-page.js —
 * pass a desc override from the shell if you want a
 * richer description than what's in the JSON.
 *
 * Usage:
 *   renderReleasePage({ desc: '...' })
 */

async function renderReleasePage(overrides = {}) {
  const artistSlug  = OctoquanDB.slugFromURL();
  const releaseSlug = OctoquanDB.releaseSlugFromURL();

  if (!artistSlug || !releaseSlug) {
    return console.error('renderReleasePage: could not determine slugs from URL');
  }

  const artist  = await OctoquanDB.getArtist(artistSlug);
  const release = await OctoquanDB.getRelease(artistSlug, releaseSlug);

  if (!artist || !release) {
    return console.error(`renderReleasePage: could not find ${artistSlug}/${releaseSlug}`);
  }

  const r = {
    ...release,
    desc: overrides.desc ?? release.desc,
  };

  

  const released   = OctoquanDB.isReleased(r);
  const streamBtns = OctoquanUI.streamButtons(r.streaming, r);
  const badge      = OctoquanUI.upcomingBadge(r);
  const dateLine   = OctoquanUI.releaseDateLine(r);
  const countdown  = OctoquanUI.countdownTimer(r);

  OctoquanUI.setMeta({
    title: `${r.title} — ${artist.name} — Octoquan Records`,
    description: `${r.title} is a ${r.type} by ${artist.name} on Octoquan Records. ${r.desc.slice(0, 120)}...`,
    keywords: `${r.title}, ${artist.name}, Octoquan Records, NWA music, independent music`,
  });

  document.getElementById('release-hero').innerHTML = `
    <div class="release-hero${released ? '' : ' release-hero--upcoming'}">
      <img class="release-art" src="${r.art}" alt="${r.title}" />
      <div class="release-info">
        <div class="breadcrumb">
          <a href="/artists">Artists</a>
          <span>·</span>
          <a href="/artists/${artist.slug}">${artist.name}</a>
          <span>·</span>
          <span>${r.title}</span>
        </div>
        <div class="release-meta">
          ${badge}
          <span>${r.type}</span><span>·</span>
          <span>${r.year}</span><span>·</span>
          <span>Octoquan Records</span>
          ${r.tracklist && r.tracklist.length && released ? `<span>·</span><span>${r.tracklist.length} tracks</span>` : ''}
        </div>
        <h1 class="release-title">${r.title}</h1>
        ${dateLine}
        ${countdown}
        <p class="release-desc">${r.desc}</p>
        ${streamBtns ? `<div class="stream-links">${streamBtns}</div>` : ''}
      </div>
    </div>`;

  // Only show tracklist if released
  if (released && r.tracklist && r.tracklist.length) {
    document.getElementById('tracklist-section').innerHTML = `
      <div class="tracklist-section">
        <div class="tracklist-inner">
          <p class="section-label">Tracklist</p>
          <ul class="tracklist">
            ${r.tracklist.map((t, i) => `
              <li class="track">
                <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="track-name">${t}</span>
              </li>`).join('')}
          </ul>
        </div>
      </div>`;
  }
}
