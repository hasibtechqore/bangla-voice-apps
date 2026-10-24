"""Generate Android launcher icons from the SEO Academy logo.

Reads android/logo.png (square logo) and overwrites the Capacitor
launcher resources under android/app/src/main/res/mipmap-*/ so the
installed app shows the SEO Academy logo instead of the default
Capacitor icon. Run from the android/ directory AFTER `npx cap add
android` (which regenerates the android/ folder) and BEFORE the
gradle build. Requires Pillow (pip install pillow).
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

HERE = Path(__file__).resolve().parent
LOGO = HERE / "logo.png"
RES = HERE / "app" / "src" / "main" / "res"

# density -> launcher icon size in px
DENSITIES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}


def square_logo():
    im = Image.open(LOGO).convert("RGBA")
    w, h = im.size
    side = min(w, h)
    im = im.crop(((w - side) // 2, (h - side) // 2,
                  (w + side) // 2, (h + side) // 2))
    return im


def circle(im, size):
    im = im.resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size, size), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def main():
    if not LOGO.exists():
        print(f"logo not found: {LOGO}")
        return 1
    logo = square_logo()
    for density, size in DENSITIES.items():
        d = RES / f"mipmap-{density}"
        if not d.is_dir():
            print(f"skip missing dir: {d}")
            continue
        # legacy + round icons
        logo.resize((size, size), Image.LANCZOS).save(d / "ic_launcher.png")
        circle(logo, size).save(d / "ic_launcher_round.png")
        # adaptive icon: logo as foreground (70% centred), solid black background
        fg_size = size * 2  # foreground canvas is larger than the icon
        fg = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
        inner = logo.resize((int(fg_size * 0.7), int(fg_size * 0.7)), Image.LANCZOS)
        fg.paste(inner, ((fg_size - inner.width) // 2, (fg_size - inner.height) // 2), inner)
        fg.save(d / "ic_launcher_foreground.png")
        Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 255)).save(
            d / "ic_launcher_background.png")
        print(f"{density}: icons written ({size}px)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
