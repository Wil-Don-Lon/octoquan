/**
 * render-artist-page.js
 * Renders the full artist bio + releases section.
 * Used on: /artists/[slug]/index.html
 *
 * The artist page shell passes its own bio/genres/riyl config
 * which OVERRIDES the JSON data for those fields — so you can
 * write a richer bio in the HTML file without touching the JSON.
 *
 * Usage:
 *   renderArtistPage({ bio: '...', genres: [...], riyl: '...' })
 *   — pass null/undefined for any field to use JSON data instead
 */

async function renderArtistPage(overrides = {}) {
  const slug = OctoquanDB.slugFromURL();
  if (!slug) return console.error('renderArtistPage: no artist slug in URL');

  const artist = await OctoquanDB.getArtist(slug);
  if (!artist) return console.error(`renderArtistPage: artist "${slug}" not found`);

  // Merge JSON data with any overrides from the page shell
  const a = {
    ...artist,
    bio:    overrides.bio    ?? artist.bio,
    genres: overrides.genres ?? artist.genres,
    riyl:   overrides.riyl   ?? (Array.isArray(artist.riyl) ? artist.riyl.join(' · ') : artist.riyl),
  };

  // Render hero
  const socialHTML = OctoquanUI.socialButtons(a.links);
  document.getElementById('artist-hero').innerHTML = `
    <img class="artist-photo" src="${a.photo}" alt="${a.name}" />
    <div class="artist-info">
      <p class="artist-number">Artist ${a.number}</p>
      <h1 class="artist-name">${a.name}</h1>
      <div class="genre-tags">
        ${a.genres.map(g => `<span class="genre-tag">${g}</span>`).join('')}
      </div>
      <p class="artist-bio">${a.bio}</p>
      <div>
        <p class="riyl-label">Recommended If You Like</p>
        <p class="riyl-list">${typeof a.riyl === 'string' ? a.riyl : a.riyl.join(' · ')}</p>
      </div>
      ${socialHTML ? `<div class="social-links">${socialHTML}</div>` : ''}
    </div>`;

  // Sort: released first, upcoming after
  const sorted = [...a.releases].sort((x, y) => {
    const xReleased = OctoquanDB.isReleased(x);
    const yReleased = OctoquanDB.isReleased(y);
    if (xReleased === yReleased) return 0;
    return xReleased ? -1 : 1;
  });

  const releasesHTML = sorted.map(r => {
    const released = OctoquanDB.isReleased(r);
    const btns     = OctoquanUI.streamButtons(r.streaming, r);
    const badge    = OctoquanUI.upcomingBadge(r);
    const dateLine = OctoquanUI.releaseDateLine(r);
    const countdown = OctoquanUI.countdownTimer(r);
    return `
      <div class="release-row${released ? '' : ' release-row--upcoming'}">
        <img class="release-art" src="${r.art}" alt="${r.title}" />
        <div class="release-info">
          <div class="release-meta">
            ${badge}
            <span>${r.type}</span><span>·</span>
            <span>${r.year}</span><span>·</span>
            <span>Octoquan Records</span>
          </div>
          <a class="release-title-link" href="/artists/${a.slug}/${r.slug}">${r.title}</a>
          ${dateLine}
          ${countdown}
          <p class="release-desc">${r.desc}</p>
          ${btns ? `<div class="stream-links">${btns}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  document.getElementById('releases-section').innerHTML = `
    <div class="releases-inner">
      <p class="section-label">Releases</p>
      ${releasesHTML || '<p style="color:var(--muted)">No releases yet.</p>'}
    </div>`;
}
