# Setup Guide

## How it works

```
Phone scans QR → octoquan.com/scan/poster1_on_campus
                      ↓
              Vercel instantly redirects to Stubs
                      ↓ (fire and forget, background)
              Google Apps Script logs row to Sheet
```

Users see `octoquan.com` briefly then land on Stubs. Clean URL, real redirect, no Google flash.

---

## Step 1 — Deploy Google Apps Script

1. Go to sheets.google.com → create a new Sheet → name it "QR Scan Tracker"
2. Extensions → Apps Script
3. Delete the default code, paste in the contents of `tracker.gs`
4. Save (Ctrl+S)
5. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** → authorize → copy the Web App URL

---

https://script.google.com/macros/s/AKfycbz0TWrt_PKxtpxDo-dMnLPkjTL57KJQNmSwufJYxC--gu60Kzn4W7JeyIMmWYGf_nDU/exec



## Step 2 — Deploy to Vercel

1. Push this folder to your GitHub repo
2. Go to vercel.com → Import your repo → Deploy
3. In Vercel → **Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `APPS_SCRIPT_URL` | your Apps Script URL from step 1 |
| `DESTINATION_URL` | `https://stubs.net/event/7868/locals-on-blast-showcase` |

4. **Redeploy** after adding env vars (Deployments → ⋯ → Redeploy)

---

## Step 3 — Connect octoquan.com

In Vercel → Settings → Domains → add `octoquan.com`

Add these records on name.com:
- `A` record: `@` → `76.76.21.21`
- `CNAME` record: `www` → `cname.vercel-dns.com`

---

## Step 4 — Update generate_qr.py

```python
APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_ID/exec"
```

Change the `tracking_url` function to point at your Vercel domain:

```python
def tracking_url(variant_id: str) -> str:
    return f"https://octoquan.com/scan/{variant_id}"
```

Regenerate QR codes:
```bash
python generate_qr.py
```

---

## Step 5 — Set up Summary sheet (optional)

In Apps Script editor → Run → `setupSummarySheet`
Creates a live Summary tab with COUNTIF totals.
