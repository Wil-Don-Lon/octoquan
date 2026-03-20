/**
 * OctoquanDB
 * Fetches artists.json and shows.json and exposes helper methods.
 * All renderers import from this.
 */

const OctoquanDB = (() => {
  let _data      = null;
  let _showsData = null;

  // ── Artists ─────────────────────────────────────────────────────

  async function load() {
    if (_data) return _data;
    const res = await fetch('/_data/artists.json');
    _data = await res.json();
    return _data;
  }

  async function getMeta() {
    const d = await load();
    return d.meta;
  }

  async function getAllArtists() {
    const d = await load();
    return d.artists;
  }

  async function getArtist(slug) {
    const artists = await getAllArtists();
    return artists.find(a => a.slug === slug) || null;
  }

  async function getArtistById(artistId) {
    const artists = await getAllArtists();
    return artists.find(a => a.artistId === artistId) || null;
  }

  async function getRelease(artistSlug, releaseSlug) {
    const artist = await getArtist(artistSlug);
    if (!artist) return null;
    return artist.releases.find(r => r.slug === releaseSlug) || null;
  }

  async function getReleaseById(releaseId) {
    const artists = await getAllArtists();
    for (const artist of artists) {
      const release = artist.releases.find(r => r.releaseId === releaseId);
      if (release) return { artist, release };
    }
    return null;
  }

  async function getFeaturedRelease() {
    const meta = await getMeta();
    if (!meta || !meta.featuredReleaseId) return null;
    return getReleaseById(meta.featuredReleaseId);
  }

  // Returns true if the release's releaseDate is today or in the past.
  function isReleased(release) {
    if (!release.releaseDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(release.releaseDate + 'T00:00:00');
    return date <= today;
  }

  // filter: 'all' | 'released' | 'upcoming'
  async function getAllReleases(filter = 'all') {
    const artists = await getAllArtists();
    const results = [];
    for (const artist of artists) {
      for (const release of artist.releases || []) {
        if (filter === 'released' && !isReleased(release)) continue;
        if (filter === 'upcoming' && isReleased(release)) continue;
        results.push({ artist, release });
      }
    }
    return results;
  }

  function formatReleaseDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ── Shows ────────────────────────────────────────────────────────

  async function loadShows() {
    if (_showsData) return _showsData;
    const res = await fetch('/_data/shows.json');
    _showsData = await res.json();
    return _showsData;
  }

  async function getAllShows() {
    const d = await loadShows();
    return d.shows || [];
  }

  // Returns shows where date is today or in the future, sorted soonest first.
  async function getUpcomingShows() {
    const shows = await getAllShows();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return shows
      .filter(s => s.status !== 'cancelled' && new Date(s.date + 'T00:00:00') >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function formatShowDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ── URL helpers ──────────────────────────────────────────────────

  function slugFromURL() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[1] || null;
  }

  function releaseSlugFromURL() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[2] || null;
  }

  return {
    load,
    getMeta,
    getAllArtists,
    getArtist,
    getArtistById,
    getRelease,
    getReleaseById,
    getFeaturedRelease,
    isReleased,
    getAllReleases,
    formatReleaseDate,
    loadShows,
    getAllShows,
    getUpcomingShows,
    formatShowDate,
    slugFromURL,
    releaseSlugFromURL,
  };
})();