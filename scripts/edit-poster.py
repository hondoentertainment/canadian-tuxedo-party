from PIL import Image, ImageDraw
import subprocess

root = r"c:\Users\kyle\OneDrive\Desktop\Canadian Tuxedo Party"
path = root + r"\assets\poster.png"

subprocess.run(["git", "checkout", "HEAD", "--", "assets/poster.png"], cwd=root, check=True)

im = Image.open(path).convert("RGB")
w, h = im.size

# Narrow left-edge wood tile — tile without horizontal stretch
tile = im.crop((48, 462, 138, 498))

cover_top = 878
cover_h = h - cover_top - 4
tile_w, tile_h = tile.size
wood = Image.new("RGB", (w, cover_h))
for y in range(0, cover_h, tile_h):
    for x in range(0, w, tile_w):
        wood.paste(tile, (x, y))

result = im.copy()
result.paste(wood, (0, cover_top))

left = Image.new("L", (w, h), 0)
ImageDraw.Draw(left).rectangle([0, h - 545, 415, h], fill=255)
right = Image.new("L", (w, h), 0)
ImageDraw.Draw(right).rectangle([w - 415, h - 545, w, h], fill=255)

result.paste(im, (0, 0), left)
result.paste(im, (0, 0), right)

result.save(path, optimize=True)
print("saved", path, result.size)
