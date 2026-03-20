#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║         OCTOQUAN RECORDS — CONTENT CLI                       ║
║                                                              ║
║  Usage:                                                      ║
║    python3 octoquan.py add-artist                            ║
║    python3 octoquan.py add-release                           ║
║    python3 octoquan.py set-featured                          ║
║    python3 octoquan.py add-show                              ║
║    python3 octoquan.py list-shows                            ║
║    python3 octoquan.py cancel-show                           ║
║    python3 octoquan.py list                                  ║
╚══════════════════════════════════════════════════════════════╝
"""

import json
import os
import re
import sys
import shutil
from datetime import date
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────
ROOT       = Path(__file__).parent
DATA_FILE  = ROOT / "_data" / "artists.json"
SHOWS_FILE = ROOT / "_data" / "shows.json"
TEMPLATES  = ROOT / "_templates"
ARTISTS    = ROOT / "artists"

# ── Canonical link key order ───────────────────────────────────
ARTIST_LINK_KEYS  = ['spotify', 'apple', 'amazon', 'pandora', 'youtube', 'soundcloud', 'bandcamp', 'qobuz', 'instagram']
RELEASE_LINK_KEYS = ['spotify', 'apple', 'amazon', 'pandora', 'youtube', 'soundcloud', 'bandcamp', 'tidal', 'qobuz']

# ── Helpers ───────────────────────────────────────────────────
def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def load_data():
    with open(DATA_FILE) as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\n✅ Saved to {DATA_FILE.relative_to(ROOT)}")

def load_shows():
    if not SHOWS_FILE.exists():
        return {"meta": {"nextShowId": 1}, "shows": []}
    with open(SHOWS_FILE) as f:
        return json.load(f)

def save_shows(data):
    with open(SHOWS_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"\n✅ Saved to {SHOWS_FILE.relative_to(ROOT)}")

def ask(prompt, default=None):
    suffix = f" [{default}]" if default else ""
    val = input(f"  {prompt}{suffix}: ").strip()
    return val if val else default

def ask_list(prompt):
    print(f"  {prompt} (comma separated):")
    val = input("  → ").strip()
    return [x.strip() for x in val.split(',') if x.strip()]

def ask_links(keys):
    links = {}
    print("  Streaming/Social links (leave blank to skip):")
    for k in keys:
        url = input(f"    {k}: ").strip()
        links[k] = url if url else None
    return links

def is_released(release_date_str):
    """Return True if releaseDate is today or in the past."""
    if not release_date_str:
        return True
    try:
        rd = date.fromisoformat(release_date_str)
        return rd <= date.today()
    except ValueError:
        return True

def next_artist_id(data):
    """Read and increment nextArtistId from meta."""
    artist_id = data['meta']['nextArtistId']
    data['meta']['nextArtistId'] += 1
    return artist_id

def next_release_id(data):
    """Read and increment nextReleaseId from meta."""
    release_id = data['meta']['nextReleaseId']
    data['meta']['nextReleaseId'] += 1
    return release_id

def next_show_id(data):
    """Read and increment nextShowId from meta."""
    show_id = data['meta']['nextShowId']
    data['meta']['nextShowId'] += 1
    return show_id

def all_releases(data):
    """Flat list of (artist, release) tuples across all artists."""
    for artist in data['artists']:
        for release in artist.get('releases', []):
            yield artist, release

def scaffold_artist(artist):
    dest = ARTISTS / artist['slug']
    dest.mkdir(parents=True, exist_ok=True)
    page = dest / "index.html"
    if page.exists():
        print(f"  ⚠️  {page.relative_to(ROOT)} already exists, skipping.")
    else:
        shutil.copy(TEMPLATES / "artist-template.html", page)
        content = page.read_text()
        content = content.replace(
            'Artist Name — Octoquan Records',
            f"{artist['name']} — Octoquan Records"
        )
        page.write_text(content)
        print(f"  📄 Created {page.relative_to(ROOT)}")
    print(f"  📁 Artist folder: {dest.relative_to(ROOT)}/")
    print(f"  💡 Drop artist photo at: assets/images/artists/{artist['slug']}/[photo].png")

def scaffold_release(artist, release):
    dest = ARTISTS / artist['slug'] / release['slug']
    dest.mkdir(parents=True, exist_ok=True)
    page = dest / "index.html"
    if page.exists():
        print(f"  ⚠️  {page.relative_to(ROOT)} already exists, skipping.")
    else:
        shutil.copy(TEMPLATES / "release-template.html", page)
        content = page.read_text()
        content = content.replace(
            'Release Title — Artist Name — Octoquan Records',
            f"{release['title']} — {artist['name']} — Octoquan Records"
        )
        page.write_text(content)
        print(f"  📄 Created {page.relative_to(ROOT)}")
    print(f"  💡 Drop album art at: assets/images/artists/{artist['slug']}/{release['slug']}.[ext]")

# ── Commands ──────────────────────────────────────────────────
def cmd_list():
    data = load_data()
    artists = data['artists']
    meta = data['meta']

    if not artists:
        print("\n  No artists yet.")
        return

    featured_id = meta.get('featuredReleaseId')
    today = date.today()
    print(f"\n{'─'*65}")
    print(f"  Featured release ID : {featured_id}")
    print(f"  Today               : {today}")
    print(f"{'─'*65}")
    for a in artists:
        status = '✅' if a['status'] == 'active' else '⏸️ '
        print(f"  {status} artistId={a['artistId']}  {a['number']}  {a['name']}  ({a['slug']})")
        for r in a.get('releases', []):
            featured_marker  = ' ★ FEATURED' if r['releaseId'] == featured_id else ''
            upcoming_marker  = '' if is_released(r.get('releaseDate')) else ' 🔜 UPCOMING'
            date_str         = r.get('releaseDate', 'no date')
            print(f"       └─ releaseId={r['releaseId']}  {r['type']} · {r['year']} · {r['title']}  ({r['slug']}){featured_marker}{upcoming_marker}")
            print(f"          releaseDate: {date_str}")
    print(f"{'─'*65}\n")

def cmd_add_artist():
    data = load_data()
    artists = data['artists']

    print("\n╔══════════════════════════╗")
    print("║   ADD ARTIST             ║")
    print("╚══════════════════════════╝\n")

    name   = ask("Artist name")
    slug   = ask("Slug (URL-safe)", slugify(name))
    number = ask("Roster number", str(len(artists) + 1).zfill(3))
    photo  = ask("Photo path", f"/assets/images/artists/{slug}/photo.png")
    genres = ask_list("Genres")
    bio    = ask("Short bio (can edit in JSON later)")
    riyl   = ask_list("Recommended if you like (artist names)")
    links  = ask_links(ARTIST_LINK_KEYS)

    if any(a['slug'] == slug for a in artists):
        print(f"\n  ❌ Artist with slug '{slug}' already exists.")
        return

    artist_id = next_artist_id(data)

    artist = {
        "artistId": artist_id,
        "slug":     slug,
        "number":   number,
        "name":     name,
        "status":   "active",
        "photo":    photo,
        "genres":   genres,
        "bio":      bio,
        "riyl":     riyl,
        "links":    links,
        "releases": []
    }

    print(f"\n  Preview:")
    print(json.dumps(artist, indent=4))
    confirm = input("\n  Add this artist? [y/N]: ").strip().lower()
    if confirm != 'y':
        print("  Cancelled.")
        return

    artists.append(artist)
    save_data(data)
    scaffold_artist(artist)
    print(f"\n🐙 Artist '{name}' added! (artistId={artist_id}) Push to GitHub to deploy.\n")

def cmd_add_release():
    data = load_data()
    artists = data['artists']

    if not artists:
        print("\n  ❌ No artists yet. Add an artist first.")
        return

    print("\n╔══════════════════════════╗")
    print("║   ADD RELEASE            ║")
    print("╚══════════════════════════╝\n")

    print("  Artists:")
    for i, a in enumerate(artists):
        print(f"    {i+1}. {a['name']} ({a['slug']})  [artistId={a['artistId']}]")
    idx = input("\n  Artist number: ").strip()
    try:
        artist = artists[int(idx) - 1]
    except (ValueError, IndexError):
        print("  ❌ Invalid selection.")
        return

    title        = ask("Release title")
    slug         = ask("Slug (URL-safe)", slugify(title))
    rtype        = ask("Type", "LP")
    year         = ask("Year", str(date.today().year))
    release_date = ask("Release date (YYYY-MM-DD)", str(date.today()))
    art          = ask("Artwork path", f"/assets/images/artists/{artist['slug']}/{slug}.png")
    desc         = ask("Short description (can edit in JSON later)")
    tracklist    = ask_list("Tracklist (track names, comma separated, or leave blank)")
    streaming    = ask_links(RELEASE_LINK_KEYS)

    if any(r['slug'] == slug for r in artist.get('releases', [])):
        print(f"\n  ❌ Release with slug '{slug}' already exists for {artist['name']}.")
        return

    release_id = next_release_id(data)

    upcoming = not is_released(release_date)
    if upcoming:
        print(f"\n  🔜 This is an UPCOMING release (releases on {release_date}).")

    release = {
        "releaseId":   release_id,
        "slug":        slug,
        "title":       title,
        "type":        rtype,
        "year":        year,
        "releaseDate": release_date,
        "art":         art,
        "desc":        desc,
        "tracklist":   tracklist if tracklist != [''] else [],
        "streaming":   streaming
    }

    print(f"\n  Preview:")
    print(json.dumps(release, indent=4))
    confirm = input("\n  Add this release? [y/N]: ").strip().lower()
    if confirm != 'y':
        print("  Cancelled.")
        return

    artist['releases'].append(release)
    save_data(data)
    scaffold_release(artist, release)

    set_now = input(f"\n  Set releaseId={release_id} as the featured release on the homepage? [y/N]: ").strip().lower()
    if set_now == 'y':
        data['meta']['featuredReleaseId'] = release_id
        save_data(data)
        print(f"  ★ Featured release updated to releaseId={release_id}.")

    print(f"\n🎵 Release '{title}' added to {artist['name']}! (releaseId={release_id}) Push to GitHub to deploy.\n")

def cmd_set_featured():
    data = load_data()

    print("\n╔══════════════════════════╗")
    print("║   SET FEATURED RELEASE   ║")
    print("╚══════════════════════════╝\n")

    releases = list(all_releases(data))
    if not releases:
        print("  ❌ No releases yet.")
        return

    current = data['meta'].get('featuredReleaseId')
    print(f"  Current featuredReleaseId: {current}\n")
    print("  Available releases:")
    for i, (artist, release) in enumerate(releases):
        marker   = ' ★' if release['releaseId'] == current else ''
        upcoming = ' 🔜' if not is_released(release.get('releaseDate')) else ''
        print(f"    {i+1}. [{release['releaseId']}] {artist['name']} — {release['title']} ({release.get('releaseDate', 'no date')}){marker}{upcoming}")

    idx = input("\n  Select release number: ").strip()
    try:
        chosen_artist, chosen_release = releases[int(idx) - 1]
    except (ValueError, IndexError):
        print("  ❌ Invalid selection.")
        return

    data['meta']['featuredReleaseId'] = chosen_release['releaseId']
    save_data(data)
    print(f"\n  ★ Featured release set to: {chosen_artist['name']} — {chosen_release['title']} (releaseId={chosen_release['releaseId']})\n")

def cmd_add_show():
    shows_data   = load_shows()

    print("\n╔══════════════════════════╗")
    print("║   ADD SHOW               ║")
    print("╚══════════════════════════╝\n")

    show_date   = ask("Date (YYYY-MM-DD)")
    venue       = ask("Venue name")
    city        = ask("City")
    state       = ask("State")
    description = ask("Description (optional)")
    ticket_link = ask("Ticket link (optional)")

    artists     = ask_list("Artists on this bill (names, comma separated)")

    show_id = next_show_id(shows_data)

    show = {
        "showId":      show_id,
        "date":        show_date,
        "venue":       venue,
        "city":        city,
        "state":       state,
        "artists":     artists,
        "description": description or None,
        "ticketLink":  ticket_link or None,
        "status":      "active"
    }

    print(f"\n  Preview:")
    print(json.dumps(show, indent=4))
    confirm = input("\n  Add this show? [y/N]: ").strip().lower()
    if confirm != 'y':
        print("  Cancelled.")
        return

    shows_data['shows'].append(show)
    save_shows(shows_data)
    print(f"\n🎤 Show at {venue} on {show_date} added! (showId={show_id}) Push to GitHub to deploy.\n")

def cmd_cancel_show():
    shows_data = load_shows()
    shows      = shows_data['shows']

    if not shows:
        print("\n  ❌ No shows yet.")
        return

    print("\n  Shows:")
    for i, s in enumerate(shows):
        status = ' [CANCELLED]' if s['status'] == 'cancelled' else ''
        print(f"    {i+1}. [{s['showId']}] {s['date']} · {s['venue']} · {s['city']}, {s['state']}{status}")

    idx = input("\n  Show number to cancel: ").strip()
    try:
        show = shows[int(idx) - 1]
    except (ValueError, IndexError):
        print("  ❌ Invalid selection.")
        return

    show['status'] = 'cancelled'
    save_shows(shows_data)
    print(f"\n  ✅ Show {show['showId']} marked as cancelled.\n")

def cmd_list_shows():
    shows_data = load_shows()
    shows      = shows_data['shows']
    today      = date.today()

    if not shows:
        print("\n  No shows yet.\n")
        return

    upcoming  = [s for s in shows if s['status'] != 'cancelled' and date.fromisoformat(s['date']) >= today]
    past      = [s for s in shows if s['status'] != 'cancelled' and date.fromisoformat(s['date']) < today]
    cancelled = [s for s in shows if s['status'] == 'cancelled']

    print(f"\n{'─'*60}")
    if upcoming:
        print("  📅 UPCOMING")
        for s in sorted(upcoming, key=lambda x: x['date']):
            print(f"    [{s['showId']}] {s['date']} · {s['venue']} · {s['city']}, {s['state']}")
    else:
        print("  📅 UPCOMING — none")
    if past:
        print("  ✅ PAST")
        for s in sorted(past, key=lambda x: x['date'], reverse=True):
            print(f"    [{s['showId']}] {s['date']} · {s['venue']} · {s['city']}, {s['state']}")
    if cancelled:
        print("  ❌ CANCELLED")
        for s in cancelled:
            print(f"    [{s['showId']}] {s['date']} · {s['venue']} · {s['city']}, {s['state']}")
    print(f"{'─'*60}\n")

def cmd_help():
    print("""
  OCTOQUAN RECORDS CLI
  ─────────────────────
  python3 octoquan.py list             List all artists and releases
  python3 octoquan.py add-artist       Add a new artist
  python3 octoquan.py add-release      Add a release to an existing artist
  python3 octoquan.py set-featured     Set the featured release on the homepage
  python3 octoquan.py list-shows       List all shows
  python3 octoquan.py add-show         Add an upcoming show
  python3 octoquan.py cancel-show      Mark a show as cancelled
  python3 octoquan.py help             Show this message
    """)

# ── Main ──────────────────────────────────────────────────────
COMMANDS = {
    'list':          cmd_list,
    'add-artist':    cmd_add_artist,
    'add-release':   cmd_add_release,
    'set-featured':  cmd_set_featured,
    'list-shows':    cmd_list_shows,
    'add-show':      cmd_add_show,
    'cancel-show':   cmd_cancel_show,
    'help':          cmd_help,
}

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'help'
    if cmd in COMMANDS:
        COMMANDS[cmd]()
    else:
        print(f"  Unknown command: {cmd}")
        cmd_help()