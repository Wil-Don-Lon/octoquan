/**
 * render-artist-grid.js
 * Renders a grid of artist cards into a target element.
 * Used on: homepage (#roster-grid), /artists (#artists-grid)
 *
 * Usage:
 *   <div id="artists-grid"></div>
 *   <script>renderArtistGrid('artists-grid')</script>
 */

async function renderArtistGrid(targetId, options = {}) {
  const { limit = null, showPlaceholders = true, placeholderCount = 2 } = options;

  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = '<p class="loading">Loading...</p>';

  try {
    let artists = await OctoquanDB.getAllArtists();
    const active = artists.filter(a => a.status === 'active');
    const displayed = limit ? active.slice(0, limit) : active;

    const cards = displayed.map(a => `
      <a class="artist-card" href="/artists/${a.slug}">
        <p class="artist-card-num">${a.number}</p>
        <img class="artist-card-img" src="${a.photo}" alt="${a.name}" />
        <h3 class="artist-card-name">${a.name}</h3>
        <p class="artist-card-genres">${a.genres.join(' · ')}</p>
        <span class="artist-card-arrow">↗</span>
      </a>`).join('');

    const placeholders = showPlaceholders
      ? Array(placeholderCount).fill(null).map((_, i) => {
          const num = String(displayed.length + i + 1).padStart(3, '0');
          return `
            <div class="artist-card dimmed">
              <p class="artist-card-num">${num}</p>
              <div class="artist-card-img-placeholder">?</div>
              <h3 class="artist-card-name">coming soon</h3>
              <p class="artist-card-genres">— · — · —</p>
            </div>`;
        }).join('')
      : '';

    container.innerHTML = cards + placeholders;
  } catch (err) {
    container.innerHTML = '<p class="error">Failed to load artists.</p>';
    console.error('renderArtistGrid:', err);
  }
}
