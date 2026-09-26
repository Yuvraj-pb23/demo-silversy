"""Rebuild the hero from the original footage without generating jewellery detail.

Run: python scripts/enhance_hero.py
Requires the existing numpy, Pillow and imageio-ffmpeg packages.
The native 1920x1080 frames, timing and hand movement are preserved.
"""
from pathlib import Path
import subprocess

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ASSETS = Path(__file__).resolve().parents[1] / "frontend/public/assets"


def enhance(frame, mask):
    pixels = np.asarray(frame, dtype=np.float32)
    fine = pixels - np.asarray(frame.filter(ImageFilter.GaussianBlur(0.85)), dtype=np.float32)
    texture = pixels - np.asarray(frame.filter(ImageFilter.GaussianBlur(2.2)), dtype=np.float32)
    local = pixels - np.asarray(frame.filter(ImageFilter.GaussianBlur(7)), dtype=np.float32)
    # Enhance existing edges and specular reflections, not the smooth white hand.
    detail = np.clip(0.7 * fine + 0.35 * texture + 0.28 * local, -22, 22)
    highlights = np.clip((pixels - 180) / 65, 0, 1) * np.clip(local, 0, 12) * 0.55
    return Image.fromarray(np.clip(pixels + mask * (detail + highlights), 0, 255).astype(np.uint8))


def main():
    reader = imageio_ffmpeg.read_frames(str(ASSETS / "hero-source.mp4"), pix_fmt="rgb24")
    metadata = next(reader)
    width, height = metadata["size"]
    assert (width, height) == (1920, 1080), "Review jewellery masks if the original footage changes"
    region = Image.new("L", (width, height))
    draw = ImageDraw.Draw(region)
    # Feathered regions cover both rings through their movement, and the bracelet.
    draw.rounded_rectangle((800, 290, 1240, 595), radius=35, fill=255)
    draw.rounded_rectangle((690, 905, 1100, 1110), radius=25, fill=255)
    mask = np.asarray(region.filter(ImageFilter.GaussianBlur(18)), dtype=np.float32)[..., None] / 255

    codec = ["-an", "-c:v", "libx264", "-preset", "slow", "-crf", "16",
             "-pix_fmt", "yuv420p", "-g", "6", "-keyint_min", "6", "-sc_threshold", "0",
             "-movflags", "+faststart", "-map_metadata", "-1", "-threads", "2"]
    command = [imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "warning", "-y",
               "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{width}x{height}",
               "-r", str(metadata["fps"]), "-i", "pipe:0",
               "-map", "0:v", *codec, str(ASSETS / "hero-web-hd.mp4"),
               "-map", "0:v", "-vf", "crop=1080:1080:(iw-1080)/2:0,setsar=1",
               *codec, str(ASSETS / "hero-mobile-hd.mp4")]
    encoder = subprocess.Popen(command, stdin=subprocess.PIPE)
    count = 0
    try:
        for data in reader:
            result = enhance(Image.frombytes("RGB", (width, height), data), mask)
            if count == 0:
                result.save(ASSETS / "hero-poster-hd.jpg", quality=96, subsampling=0)
                result.crop((420, 0, 1500, 1080)).save(
                    ASSETS / "hero-poster-mobile-hd.jpg", quality=96, subsampling=0)
            encoder.stdin.write(result.tobytes())
            count += 1
    finally:
        encoder.stdin.close()
        reader.close()
    if encoder.wait() != 0:
        raise RuntimeError("Hero encoding failed")
    print(f"Enhanced {count} native Full HD frames; desktop/mobile videos and matching posters saved.")


if __name__ == "__main__":
    main()
