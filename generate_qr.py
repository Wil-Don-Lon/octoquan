"""
Music Show QR Code Generator
------------------------------
Generates styled QR codes for poster style × location combos.
Each scan hits a Google Apps Script URL which logs a row to
Google Sheets and redirects the phone to your ticketing page.

Usage:
  python generate_qr.py   # Generate all QR codes
"""

import argparse
from pathlib import Path

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import (
    RoundedModuleDrawer,
    CircleModuleDrawer,
    GappedSquareModuleDrawer,
)
from qrcode.image.styles.colormasks import (
    SolidFillColorMask,
    RadialGradiantColorMask,
    VerticalGradiantColorMask,
)
from PIL import Image, ImageDraw, ImageFont

# ─────────────────────────────────────────────
#  CONFIGURATION — edit these
# ─────────────────────────────────────────────

DESTINATION_URL  = "https://stubs.net/event/7868/locals-on-blast-showcase"

# Paste your deployed Apps Script URL here (see SETUP.md)
APPS_SCRIPT_URL  = "https://script.google.com/macros/s/AKfycbxZsK-fzpXglJp4fCBXXIn6qp2IwBLksJQYhuU6-6koDN2yTp-4398TXAMyiq2-dczg/exec"

OUTPUT_DIR       = Path("qr_output")

# ── 3 poster styles ──────────────────────────
POSTER_STYLES = {
    "1": {
        "drawer":       RoundedModuleDrawer(),
        "color_mask":   RadialGradiantColorMask(
                            back_color=(10, 10, 10),
                            center_color=(255, 50, 200),
                            edge_color=(50, 200, 255),
                        ),
        "border_color": (255, 50, 200),
        "bg_color":     (10, 10, 10),
        "text_color":   (255, 255, 255),
    },
    "2": {
        "drawer":       GappedSquareModuleDrawer(),
        "color_mask":   SolidFillColorMask(
                            back_color=(255, 255, 255),
                            front_color=(20, 20, 20),
                        ),
        "border_color": (20, 20, 20),
        "bg_color":     (255, 255, 255),
        "text_color":   (20, 20, 20),
    },
    "3": {
        "drawer":       CircleModuleDrawer(),
        "color_mask":   VerticalGradiantColorMask(
                            back_color=(5, 5, 30),
                            top_color=(0, 200, 255),
                            bottom_color=(100, 0, 255),
                        ),
        "border_color": (0, 200, 255),
        "bg_color":     (5, 5, 30),
        "text_color":   (200, 240, 255),
    },
}

# ── 2 locations ──────────────────────────────
LOCATIONS = {
    "on_campus":  "On Campus",
    "off_campus": "Off Campus",
}

# ─────────────────────────────────────────────
#  BUILD VARIANT LIST  (style × location)
# ─────────────────────────────────────────────

def build_variants():
    variants = []
    for style_key, style in POSTER_STYLES.items():
        for loc_key, loc_label in LOCATIONS.items():
            variants.append({
                "id":           f"poster{style_key}_{loc_key}",
                "style_key":    style_key,
                "loc_key":      loc_key,
                "display_name": f"Poster {style_key} — {loc_label}",
                **style,
            })
    return variants

VARIANTS = build_variants()

# ─────────────────────────────────────────────
#  QR GENERATION
# ─────────────────────────────────────────────

def tracking_url(variant_id: str) -> str:
    """Each QR points directly at the Apps Script with variant as a query param."""
    return f"{APPS_SCRIPT_URL}?variant={variant_id}"


def make_qr(variant: dict, destination: str) -> Image.Image:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=18,
        border=3,
    )
    qr.add_data(destination)
    qr.make(fit=True)
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=variant["drawer"],
        color_mask=variant["color_mask"],
    ).convert("RGBA")

    # ── embed logo if logo.png exists next to this script ──
    logo_path = Path(__file__).parent / "logo.png"
    if logo_path.exists():
        logo    = Image.open(logo_path).convert("RGBA")
        qw, qh  = img.size
        logo_max = int(qw * 0.22)
        logo    = logo.resize((logo_max, logo_max), Image.LANCZOS)

        bg_r, bg_g, bg_b = variant["bg_color"]
        r, g, b, a = logo.split()
        colored = Image.merge("RGBA", (
            r.point(lambda p: int(p * bg_r / 255)),
            g.point(lambda p: int(p * bg_g / 255)),
            b.point(lambda p: int(p * bg_b / 255)),
            a,
        ))

        pad      = 8
        box_size = logo_max + pad * 2
        box      = Image.new("RGBA", (box_size, box_size), variant["bg_color"] + (255,))
        box.paste(colored, (pad, pad), colored)

        cx = (qw - box_size) // 2
        cy = (qh - box_size) // 2
        img.paste(box, (cx, cy), box)
    else:
        print(f"  ⚠️   logo.png not found — skipping logo overlay")

    return img


def add_frame(qr_img: Image.Image, variant: dict) -> Image.Image:
    pad        = 40
    label_h    = 68
    border_w   = 4
    qw, qh     = qr_img.size
    tw         = qw + pad * 2
    th         = qh + pad * 2 + label_h

    bg   = variant["bg_color"]
    bord = variant["border_color"]
    txt  = variant["text_color"]

    canvas = Image.new("RGBA", (tw, th), bg + (255,))
    draw   = ImageDraw.Draw(canvas)

    draw.rectangle([border_w, border_w, tw-border_w-1, th-border_w-1],
                   outline=bord, width=border_w)
    draw.rectangle([border_w+6, border_w+6, tw-border_w-7, th-border_w-7],
                   outline=bord+(60,), width=1)

    canvas.paste(qr_img, (pad, pad), qr_img)

    try:
        font_lg = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
        font_sm = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except Exception:
        font_lg = font_sm = ImageFont.load_default()

    line1 = f"Poster {variant['style_key']}"
    bb = draw.textbbox((0, 0), line1, font=font_lg)
    draw.text(((tw - (bb[2]-bb[0])) // 2, pad+qh+12), line1, fill=txt, font=font_lg)

    line2 = LOCATIONS[variant["loc_key"]]
    bb2 = draw.textbbox((0, 0), line2, font=font_sm)
    draw.text(((tw - (bb2[2]-bb2[0])) // 2, pad+qh+38), line2, fill=bord, font=font_sm)

    al = 18
    for x0, y0, dx, dy in [(4,4,1,1),(tw-5,4,-1,1),(4,th-5,1,-1),(tw-5,th-5,-1,-1)]:
        draw.line([(x0,y0),(x0+dx*al,y0)], fill=bord, width=3)
        draw.line([(x0,y0),(x0,y0+dy*al)], fill=bord, width=3)

    return canvas


def generate_all():
    OUTPUT_DIR.mkdir(exist_ok=True)
    print(f"\n🎵  Music Show QR Generator")
    print(f"    Destination  : {DESTINATION_URL}")
    print(f"    Tracking via : {APPS_SCRIPT_URL[:60]}...")
    print(f"    Output       : {OUTPUT_DIR.resolve()}\n")
    print(f"    {len(POSTER_STYLES)} styles × {len(LOCATIONS)} locations = {len(VARIANTS)} QR codes\n")

    for v in VARIANTS:
        url    = tracking_url(v["id"])
        qr     = make_qr(v, url)
        framed = add_frame(qr, v)
        out    = OUTPUT_DIR / f"{v['id']}.png"
        framed.save(out)
        print(f"  ✅  {v['display_name']:<36}  →  {out.name}")

    print(f"\n  Done! Print these and go.\n")


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Music Show QR Code Generator")
    parser.add_argument("--url",  type=str, help="Override destination URL")
    args = parser.parse_args()
    if args.url:
        DESTINATION_URL = args.url
    generate_all()