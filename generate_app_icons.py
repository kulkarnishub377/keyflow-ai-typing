"""
KeyFlow Official Transparent Brand Icon & Windows Executable Generator.
Generates 100% transparent PNGs and ICO files featuring only the glowing KeyFlow Silk Ribbon 'K' mark.
"""
import sys
import subprocess
from pathlib import Path

# Ensure Pillow is available
try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    print("📦 Installing Pillow for icon processing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
web_dir = ROOT / "web"
assets_dir = web_dir / "assets"
assets_dir.mkdir(parents=True, exist_ok=True)

print("🎨 Rendering 100% Transparent Glowing Silk Ribbon 'K' Mark...")

# High-resolution 512x512 canvas with 100% transparent background
size = 512
img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

# 1. Lower Diagonal Leg (Indigo to Pink Gradient)
leg_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
leg_draw = ImageDraw.Draw(leg_layer)
# Draw smooth angled lower leg
leg_pts = [(210, 260), (370, 410), (410, 400), (420, 360), (380, 310), (250, 220)]
leg_draw.polygon(leg_pts, fill=(236, 72, 153, 255))
for i in range(12):
    leg_draw.line([(220 - i*2, 250 + i*2), (390 - i*2, 380 + i*2)], fill=(129, 140, 248, 255 - i*15), width=18)

# 2. Upper Diagonal Arm (Indigo to Magenta Gradient)
arm_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
arm_draw = ImageDraw.Draw(arm_layer)
arm_pts = [(190, 240), (350, 100), (395, 110), (410, 150), (370, 205), (235, 275)]
arm_draw.polygon(arm_pts, fill=(168, 85, 247, 255))
for i in range(12):
    arm_draw.line([(205 + i*2, 255 - i*2), (375 + i*2, 125 - i*2)], fill=(244, 63, 94, 255 - i*15), width=18)

# 3. Main Silk Ribbon Loop & Stem (Cyan to Electric Blue to Indigo)
stem_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
stem_draw = ImageDraw.Draw(stem_layer)

# Draw elegant vertical ribbon loop
stem_draw.rounded_rectangle([130, 80, 240, 432], radius=55, fill=(0, 242, 254, 255))
# Center hollow cut-out for folding loop
stem_draw.rounded_rectangle([175, 130, 195, 382], radius=10, fill=(0, 0, 0, 0))

# Gradient overlay on vertical stem
for y in range(80, 432):
    t = (y - 80) / 352.0
    r = int(0 * (1 - t) + 168 * t)
    g = int(242 * (1 - t) + 85 * t)
    b = int(254 * (1 - t) + 247 * t)
    # Highlight lines
    stem_draw.line([(135, y), (170, y)], fill=(r, g, b, 255), width=2)
    stem_draw.line([(200, y), (235, y)], fill=(r, g, b, 255), width=2)

# Composite all layers onto transparent canvas
composite = Image.alpha_composite(leg_layer, arm_layer)
composite = Image.alpha_composite(composite, stem_layer)

# 4. Generate Soft Ambient Neon Glow
glow = composite.filter(ImageFilter.GaussianBlur(18))
glow_subtle = composite.filter(ImageFilter.GaussianBlur(6))

img = Image.alpha_composite(img, glow)
img = Image.alpha_composite(img, glow_subtle)
img = Image.alpha_composite(img, composite)

# 5. Save 100% Transparent PNGs
favicon_ico_path = web_dir / "favicon.ico"
favicon_png_path = web_dir / "favicon.png"
logo_png_path = ROOT / "keyflow_logo.png"

# Save transparent 512x512 and 256x256 PNGs
img.save(logo_png_path, format="PNG")
img.resize((256, 256), Image.Resampling.LANCZOS).save(favicon_png_path, format="PNG")
img.save(assets_dir / "keyflow_mark.png", format="PNG")

# Save multi-layer Windows .ico file with full transparency
icon_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
img.save(favicon_ico_path, format="ICO", sizes=icon_sizes)

print(f"✅ Saved 100% Transparent {favicon_ico_path}")
print(f"✅ Saved 100% Transparent {favicon_png_path}")
print(f"✅ Saved 100% Transparent {logo_png_path}")

print("\n⚙️ Recompiling dist/KeyFlow.exe with the transparent KeyFlow icon...")
spec_path = ROOT / "build.spec"
subprocess.check_call(["pyinstaller", str(spec_path), "--noconfirm"])

print("\n🎉 SUCCESS! dist/KeyFlow.exe is compiled with your 100% transparent KeyFlow Ribbon 'K' mark!")
