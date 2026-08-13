#!/usr/bin/env python3
"""Generate the canonical BukieBrainJobs brand asset set from master logos.

PRIMARY MASTER (3D glossy badge):
  docs/06-brand/assets/logo-appicon-3d-2048.png   highest-res source
  docs/06-brand/assets/logo-appicon-3d.svg        vector source (future-proofing)

SECONDARY MASTERS:
  docs/06-brand/assets/wordmark-banner-2280.png   landscape wordmark (BukieBrainJobs text)
  docs/06-brand/assets/logo-mark-384.png          flat transparent mark (fallback variant)

Outputs (canonical set, nothing more):
  apps/web/public/favicon.ico                     root favicon
  apps/web/public/icons/                          PWA icons (64..512, maskable 192/512, win11)
  apps/web/public/icons/apple-touch-icon-180x180.png
  apps/web/public/images/logo-icon.png            (wordmark banner, small) - kept? NO.
  apps/web/public/images/logo-mark-384.png        (3D badge)
  apps/web/public/images/wordmark-banner-2280.png (landscape wordmark)
  apps/web/public/images/og-banner-1200x630.png   (open graph)
  apps/mobile/assets/images/                      mobile equivalents

Deletes: any leftover sizes not in the canonical set are left untouched (do not
delete other people's files). Duplicates in /uploads stay in /uploads only.
"""
import os
import shutil
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

HERE = os.path.dirname(os.path.abspath(__file__))
MOUNT = "/mnt/f848e474-3d7d-4728-8c9f-cff0d29d3ff5/bukiebrainjobs"
ASSETS = os.path.join(MOUNT, "docs/06-brand/assets")

BADGE3D = os.path.join(ASSETS, "logo-appicon-3d-2048.png")
BANNER = os.path.join(ASSETS, "wordmark-banner-2280.png")

WEB_IMG = os.path.join(MOUNT, "apps/web/public/images")
WEB_ICONS = os.path.join(MOUNT, "apps/web/public/icons")
WEB_ROOT = os.path.join(MOUNT, "apps/web/public")
MOBILE = os.path.join(MOUNT, "apps/mobile/assets/images")


def save(im, path, size=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if size:
        im = im.resize(size, Image.LANCZOS)
    im.save(path, optimize=True)
    print(f"  {os.path.basename(path)} {im.size}")


def main():
    badge = Image.open(BADGE3D).convert("RGBA")

    print("=== web: /public/icons/ ===")
    for s in (64, 128, 192, 256, 384, 512):
        save(badge, os.path.join(WEB_ICONS, f"icon-{s}x{s}.png"), (s, s))
    for s in (192, 512):
        # maskable: keep badge inside 60% safe zone
        canvas = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        icon = badge.resize((int(s * 0.6), int(s * 0.6)), Image.LANCZOS)
        canvas.paste(icon, ((s - icon.width) // 2, (s - icon.height) // 2), icon)
        save(canvas, os.path.join(WEB_ICONS, f"icon-maskable-{s}x{s}.png"))
    save(badge, os.path.join(WEB_ICONS, "apple-touch-icon-180x180.png"), (180, 180))
    save(badge, os.path.join(WEB_ICONS, "windows11/SmallTile.scale-100.png"), (71, 71))
    save(badge, os.path.join(WEB_ICONS, "windows11/Square150x150Logo.scale-100.png"), (150, 150))
    save(badge, os.path.join(WEB_ICONS, "windows11/Square44x44Logo.scale-100.png"), (44, 44))
    save(badge, os.path.join(WEB_ICONS, "windows11/LargeTile.scale-100.png"), (310, 310))

    print("=== web: favicon.ico ===")
    badge.resize((256, 256), Image.LANCZOS).save(
        os.path.join(WEB_ROOT, "favicon.ico"),
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
    )
    print("  favicon.ico multi-size")

    print("=== web: /public/images/ (canonical images) ===")
    save(badge, os.path.join(WEB_IMG, "logo-icon.png"), (192, 192))
    save(badge, os.path.join(WEB_IMG, "logo-mark-384.png"), (384, 384))
    save(badge, os.path.join(WEB_IMG, "logo-badge-512.png"), (512, 512))
    banner = Image.open(BANNER).convert("RGBA")
    save(banner, os.path.join(WEB_IMG, "wordmark-banner-2280.png"), banner.size)
    # OG banner: 1200x630 white canvas with the landscape wordmark centered
    og = banner.resize((1200, int(banner.height * 1200 / banner.width)), Image.LANCZOS)
    og_canvas = Image.new("RGB", (1200, 630), "#FFFFFF")
    og_canvas.paste(og.convert("RGB"), (0, (630 - og.height) // 2))
    save(og_canvas, os.path.join(WEB_IMG, "og-banner-1200x630.png"))

    print("=== mobile: /assets/images/ ===")
    save(badge, os.path.join(MOBILE, "logo-icon.png"), (192, 192))
    save(badge, os.path.join(MOBILE, "logo-main.png"), (512, 512))
    save(badge, os.path.join(MOBILE, "logo-hero.png"), (600, 600))
    save(banner, os.path.join(MOBILE, "wordmark-banner.png"), banner.size)
    splash = Image.new("RGB", (1024, 1024), "#FFFFFF")
    icon = badge.resize((512, 512), Image.LANCZOS)
    splash.paste(icon, (256, 256), icon)
    save(splash, os.path.join(MOBILE, "splash-icon.png"))

    print("=== cleanup: remove superseded derived sizes no longer in canonical set ===")
    remove_candidates = [
        # old sizes generated from flat master that the 3D badge now replaces
        os.path.join(WEB_ICONS, "icon-72x72.png"),
        os.path.join(WEB_ICONS, "icon-96x96.png"),
        os.path.join(WEB_ICONS, "icon-144x144.png"),
        os.path.join(WEB_ICONS, "icon-152x152.png"),
    ]
    for p in remove_candidates:
        if os.path.exists(p):
            os.remove(p)
            print(f"  removed {p}")

    print("Done.")


if __name__ == "__main__":
    main()
