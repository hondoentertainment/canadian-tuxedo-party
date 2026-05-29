from PIL import Image, ImageDraw

ROOT = r"c:\Users\kyle\OneDrive\Desktop\Canadian Tuxedo Party"
SOURCE = ROOT + r"\Canadian Tuxedo Party.png"
OUTPUT = ROOT + r"\assets\poster.png"


def main() -> None:
    im = Image.open(SOURCE).convert("RGB")
    width, height = im.size

    # Wood plank tile from the background (avoid stretching artifacts).
    tile = im.crop((48, 462, 138, 498))
    tile_w, tile_h = tile.size

    cover_top = 878
    cover_h = height - cover_top
    wood = Image.new("RGB", (width, cover_h))
    for y in range(0, cover_h, tile_h):
        for x in range(0, width, tile_w):
            wood.paste(tile, (x, y))

    result = im.copy()
    result.paste(wood, (0, cover_top))

    # Restore denim jacket (left) and jeans (right) corners.
    left_mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(left_mask).rectangle([0, height - 545, 415, height], fill=255)

    right_mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(right_mask).rectangle([width - 415, height - 545, width, height], fill=255)

    result.paste(im, (0, 0), left_mask)
    result.paste(im, (0, 0), right_mask)

    result.save(OUTPUT, optimize=True)
    print("saved", OUTPUT, result.size)


if __name__ == "__main__":
    main()
