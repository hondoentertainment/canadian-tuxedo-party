from __future__ import annotations

import subprocess
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"c:\Users\kyle\OneDrive\Desktop\Canadian Tuxedo Party")
OUTPUT = ROOT / "assets" / "poster.png"
FONT = ROOT / "assets" / "fonts" / "BebasNeue-Regular.ttf"
USER_SOURCE = ROOT / "assets" / "poster-base.png"
TARGET_SIZE = (1086, 1448)
DENIM = (35, 66, 98)
SHADOW = (90, 70, 50, 110)


def load_poster() -> Image.Image:
    if USER_SOURCE.exists():
        poster = Image.open(USER_SOURCE).convert("RGBA")
        if poster.size != TARGET_SIZE:
            poster = poster.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
        return poster

    data = subprocess.check_output(["git", "show", "be42f91:assets/poster.png"])
    return Image.open(BytesIO(data)).convert("RGBA")


def fit_font(
    draw: ImageDraw.ImageDraw,
    lines: list[str],
    font_path: Path,
    max_width: int,
    start_size: int,
) -> ImageFont.FreeTypeFont:
    size = start_size
    while size > 18:
        font = ImageFont.truetype(str(font_path), size=size)
        widths = [draw.textbbox((0, 0), line, font=font)[2] for line in lines]
        if max(widths) <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(str(font_path), size=18)


def draw_line(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont,
    center_x: int,
    y: int,
) -> int:
    box = draw.textbbox((0, 0), text, font=font)
    width = box[2] - box[0]
    height = box[3] - box[1]
    x = center_x - width // 2
    draw.text((x + 2, y + 2), text, font=font, fill=SHADOW)
    draw.text((x, y), text, font=font, fill=DENIM + (255,))
    return height


def main() -> None:
    poster = load_poster()
    overlay = Image.new("RGBA", poster.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    lines = [
        "SOUNDS BY",
        "DJ HOLMZEN & JAE THE ALCHEMIST",
    ]
    max_width = 460
    line1_font = fit_font(draw, [lines[0]], FONT, max_width, 58)
    line2_font = fit_font(draw, [lines[1]], FONT, max_width, 50)

    center_x = poster.size[0] // 2
    top_y = 1010
    gap = 8

    line1_h = draw_line(draw, lines[0], line1_font, center_x, top_y)
    draw_line(draw, lines[1], line2_font, center_x, top_y + line1_h + gap)

    result = Image.alpha_composite(poster, overlay).convert("RGB")
    result.save(OUTPUT, format="PNG", compress_level=6)
    print("saved", OUTPUT, result.size)


if __name__ == "__main__":
    main()
