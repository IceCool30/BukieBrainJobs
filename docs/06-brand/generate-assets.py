#!/usr/bin/env python3
"""Generate the canonical BukieBrainJobs brand assets from the approved B master.

The reusable logo keeps transparent pixels outside the white rounded tile. Installed
web, PWA, Apple, and Windows icons use an opaque white canvas so platform masks do
not introduce an unintended dark or coloured background.
"""
from base64 import b64encode
from io import BytesIO
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "docs/06-brand/assets"
SOURCE = ASSETS / "logo-appicon-3d-2048.png"
BANNER = ASSETS / "wordmark-banner-2280.png"
WEB_ROOT = ROOT / "apps/web/public"
WEB_IMG = WEB_ROOT / "images"
WEB_ICONS = WEB_ROOT / "icons"
MOBILE = ROOT / "apps/mobile/assets/images"


def opaque(image):
    canvas = Image.new("RGBA", image.size, "#FFFFFF")
    canvas.alpha_composite(image)
    return canvas


def save(image, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, optimize=True)
    print(f"  {path.relative_to(ROOT)} {image.size}")


def resized(image, size):
    return image.resize((size, size), Image.Resampling.LANCZOS)


def main():
    badge = Image.open(SOURCE).convert("RGBA")
    banner = Image.open(BANNER).convert("RGBA")

    for size in (64, 128, 192, 256, 384, 512):
        save(opaque(resized(badge, size)), WEB_ICONS / f"icon-{size}x{size}.png")
    for size in (192, 512):
        save(opaque(resized(badge, size)), WEB_ICONS / f"icon-maskable-{size}x{size}.png")
    save(opaque(resized(badge, 180)), WEB_ICONS / "apple-touch-icon-180x180.png")
    for size, name in ((71, "SmallTile.scale-100.png"), (150, "Square150x150Logo.scale-100.png"), (44, "Square44x44Logo.scale-100.png"), (310, "LargeTile.scale-100.png")):
        save(opaque(resized(badge, size)), WEB_ICONS / "windows11" / name)

    favicon = opaque(resized(badge, 256))
    favicon.save(WEB_ROOT / "favicon.ico", sizes=((16, 16), (32, 32), (48, 48), (64, 64)))
    png = BytesIO()
    opaque(resized(badge, 512)).save(png, format="PNG", optimize=True)
    encoded = b64encode(png.getvalue()).decode()
    (WEB_ROOT / "favicon.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,{encoded}"/></svg>\n'
    )

    for size, name in ((192, "logo-icon.png"), (384, "logo-mark-384.png"), (512, "logo-badge-512.png")):
        save(resized(badge, size), WEB_IMG / name)
    save(banner, WEB_IMG / "wordmark-banner-2280.png")
    og = banner.resize((1200, round(banner.height * 1200 / banner.width)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1200, 630), "#FFFFFF")
    canvas.paste(og.convert("RGB"), (0, (630 - og.height) // 2))
    save(canvas, WEB_IMG / "og-banner-1200x630.png")

    for size, name in ((192, "logo-icon.png"), (512, "logo-main.png"), (600, "logo-hero.png")):
        save(resized(badge, size), MOBILE / name)
    save(banner, MOBILE / "wordmark-banner.png")
    splash = Image.new("RGBA", (1024, 1024), "#FFFFFF")
    splash.alpha_composite(resized(badge, 512), (256, 256))
    save(splash, MOBILE / "splash-icon.png")

    for name in ("icon-72x72.png", "icon-96x96.png", "icon-144x144.png", "icon-152x152.png"):
        path = WEB_ICONS / name
        if path.exists():
            path.unlink()
            print(f"  removed {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
