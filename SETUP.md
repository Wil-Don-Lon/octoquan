# Setup Guide — QR Scan Tracker via Google Sheets

No server needed. Google runs this 24/7 for free.
Takes about 5 minutes.

---

## Step 1 — Create a Google Sheet

1. Go to sheets.google.com → click **Blank**
2. Name it something like "QR Scan Tracker"

---

## Step 2 — Open Apps Script

1. In your new Sheet: **Extensions → Apps Script**
2. Delete the default code in the editor
3. Open `tracker.gs` (included with this project) and paste the entire contents in
4. At the top of the script, set your ticketing URL:
   ```js
   var DESTINATION_URL = "https://your-actual-ticketing-url.com";
   ```
5. Click **Save** (💾 or Ctrl+S)

---

## Step 3 — Deploy the script

1. Click **Deploy → New deployment**
2. Click the gear ⚙️ next to "Type" → select **Web app**
3. Fill in:
   - Description: `QR Tracker`
   - Execute as: **Me**
   - Who has access: **Anyone**  ← important, phones need to reach this
4. Click **Deploy**
5. Click **Authorize access** and follow the Google sign-in prompts
6. **Copy the Web app URL** — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 4 — Set up the Summary tab (optional but nice)

1. Back in the Apps Script editor, click **Run → Run function → setupSummarySheet**
2. This creates a "Summary" tab in your Sheet with live COUNTIF formulas
3. It updates automatically every time a new scan comes in

---

## Step 5 — Update generate_qr.py

Open `generate_qr.py` and paste your URL into the config at the top:

```python
DESTINATION_URL  = "https://your-actual-ticketing-url.com"
APPS_SCRIPT_URL  = "https://script.google.com/macros/s/AKfycb.../exec"
```

Then regenerate your QR codes:
```bash
python generate_qr.py
```

Print the images from `qr_output/` and you're done.

---

## What the Sheet looks like

**Scans tab** — one row per scan:
| Timestamp           | Variant ID          | Poster Style | Location   | Label                  |
|---------------------|---------------------|--------------|------------|------------------------|
| 2026-03-13 19:42:11 | poster1_on_campus   | 1            | On Campus  | Poster 1 — On Campus  |
| 2026-03-13 19:45:03 | poster3_off_campus  | 3            | Off Campus | Poster 3 — Off Campus |

**Summary tab** — live totals:
| Variant               | Style | Location   | Scan Count |
|-----------------------|-------|------------|------------|
| Poster 1 — On Campus  | 1     | On Campus  | 12         |
| Poster 1 — Off Campus | 1     | Off Campus | 7          |
| ...                   |       |            |            |
| TOTAL                 |       |            | 42         |

---

## Adding more poster styles or locations

Edit `VARIANT_LABELS` in `tracker.gs` and `POSTER_STYLES` / `LOCATIONS` in `generate_qr.py`
to match, then redeploy the script and regenerate your QR codes.
