from PIL import Image
import numpy as np

ROOT = r"c:\Users\kyle\OneDrive\Desktop\Canadian Tuxedo Party"
SOURCE = ROOT + r"\assets\poster.png"
OUTPUT = ROOT + r"\assets\poster.png"


def tile_patch(ref: np.ndarray, width: int, height: int) -> np.ndarray:
    ref_h, ref_w = ref.shape[:2]
    patch = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(0, height, ref_h):
        for x in range(0, width, ref_w):
            h = min(ref_h, height - y)
            w = min(ref_w, width - x)
            patch[y : y + h, x : x + w] = ref[:h, :w]
    return patch


def arrow_only_mask(arr: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    y0, y1 = 870, 1345
    x0, x1 = 300, 780

    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)

    region = np.zeros((h, w), dtype=bool)
    region[y0:y1, x0:x1] = True

    brown = (r > 80) & (r < 210) & (g > 40) & (g < 160) & (b < 110)
    white = (r > 200) & (g > 195) & (b > 180)
    denim = (b > 110) & (b > r + 10) & (g < 180) & (r < 130)
    tan = (r > 130) & (g > 110) & (b > 80) & (r > b) & (g > b) & (r < 245)
    wood = (r > 170) & (g > 160) & (b > 150) & (np.abs(r - g) < 20) & (b <= r + 5)

    return region & (brown | white | denim | tan) & ~wood


def main() -> None:
    poster = Image.open(SOURCE).convert("RGB")
    arr = np.array(poster)
    mask = arrow_only_mask(arr)

    if not mask.any():
        raise SystemExit("arrow mask empty")

    ys, xs = np.where(mask)
    pad = 2
    top = max(0, ys.min() - pad)
    bottom = min(arr.shape[0], ys.max() + pad + 1)
    left = max(0, xs.min() - pad)
    right = min(arr.shape[1], xs.max() + pad + 1)

    width = right - left
    height = bottom - top

    # Pure wood background sample (no text or denim).
    ref = arr[100:126, 230:480]
    patch = tile_patch(ref, width, height)
    local_mask = mask[top:bottom, left:right]

    result = arr.copy()
    box = result[top:bottom, left:right]
    box[local_mask] = patch[local_mask]
    result[top:bottom, left:right] = box

    Image.fromarray(result).save(OUTPUT, format="PNG", compress_level=6)
    print("saved", OUTPUT, poster.size, "removed", int(local_mask.sum()), "pixels")


if __name__ == "__main__":
    main()
