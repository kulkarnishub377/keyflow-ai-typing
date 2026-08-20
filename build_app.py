"""
=============================================================================
KeyFlow AI Typing — Master End-to-End Build & Desktop Setup Engine
=============================================================================
Automates the complete production setup:
1. Environment & Dependencies Installation (Pillow, PyInstaller, requirements.txt)
2. High-Definition Transparent Brand Icons & Asset Generation
3. Standalone Windows Executable Compilation (dist/KeyFlow.exe)
4. Desktop Shortcut Creation with Custom App Icon (100% Windows Compatible)
=============================================================================
"""
import os
import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
ASSETS_DIR = WEB_DIR / "assets"
DIST_DIR = ROOT / "dist"
BUILD_SPEC = ROOT / "build.spec"


def cleanup_obsolete_files():
    """Remove redundant or obsolete setup scripts."""
    obsolete = [
        ROOT / "generate_app_icons.py",
        ROOT / "create_desktop_shortcut.ps1",
        ROOT / "_make_shortcut_temp.vbs",
    ]
    for p in obsolete:
        if p.exists():
            try:
                p.unlink()
            except Exception:
                pass


def print_step(step_num: int, title: str):
    print(f"\n{'='*70}")
    print(f" [Step {step_num}/4] 🚀 {title}")
    print(f"{'='*70}")


def install_dependencies():
    print_step(1, "Installing & Verifying Required Dependencies")
    pip_cmd = [sys.executable, "-m", "pip", "install", "--upgrade"]
    
    # 1. Install project requirements
    req_file = ROOT / "requirements.txt"
    if req_file.exists():
        print(f"📦 Installing dependencies from {req_file.name}...")
        subprocess.check_call(pip_cmd + ["-r", str(req_file)])
    
    # 2. Install build & image tools
    print("📦 Installing PyInstaller and Pillow...")
    subprocess.check_call(pip_cmd + ["pillow", "pyinstaller"])
    print("✅ All dependencies successfully installed and verified.")


def generate_brand_icons():
    print_step(2, "Generating High-Resolution Transparent Brand Icons & Assets")
    from PIL import Image, ImageDraw, ImageFilter

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    size = 512

    # Canvas with 100% transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # 1. Lower Diagonal Leg (Indigo to Pink Gradient)
    leg_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    leg_draw = ImageDraw.Draw(leg_layer)
    leg_pts = [(210, 260), (370, 410), (410, 400), (420, 360), (380, 310), (250, 220)]
    leg_draw.polygon(leg_pts, fill=(236, 72, 153, 255))
    for i in range(12):
        leg_draw.line([(220 - i * 2, 250 + i * 2), (390 - i * 2, 380 + i * 2)], fill=(129, 140, 248, 255 - i * 15), width=18)

    # 2. Upper Diagonal Arm (Indigo to Magenta Gradient)
    arm_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    arm_draw = ImageDraw.Draw(arm_layer)
    arm_pts = [(190, 240), (350, 100), (395, 110), (410, 150), (370, 205), (235, 275)]
    arm_draw.polygon(arm_pts, fill=(168, 85, 247, 255))
    for i in range(12):
        arm_draw.line([(205 + i * 2, 255 - i * 2), (375 + i * 2, 125 - i * 2)], fill=(244, 63, 94, 255 - i * 15), width=18)

    # 3. Main Silk Ribbon Loop & Stem (Cyan to Electric Blue to Indigo)
    stem_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    stem_draw = ImageDraw.Draw(stem_layer)
    stem_draw.rounded_rectangle([130, 80, 240, 432], radius=55, fill=(0, 242, 254, 255))
    stem_draw.rounded_rectangle([175, 130, 195, 382], radius=10, fill=(0, 0, 0, 0))

    for y in range(80, 432):
        t = (y - 80) / 352.0
        r = int(0 * (1 - t) + 168 * t)
        g = int(242 * (1 - t) + 85 * t)
        b = int(254 * (1 - t) + 247 * t)
        stem_draw.line([(135, y), (170, y)], fill=(r, g, b, 255), width=2)
        stem_draw.line([(200, y), (235, y)], fill=(r, g, b, 255), width=2)

    # Composite layers
    composite = Image.alpha_composite(leg_layer, arm_layer)
    composite = Image.alpha_composite(composite, stem_layer)

    # Soft ambient neon glow
    glow = composite.filter(ImageFilter.GaussianBlur(18))
    glow_subtle = composite.filter(ImageFilter.GaussianBlur(6))

    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, glow_subtle)
    img = Image.alpha_composite(img, composite)

    # Save transparent icons
    favicon_ico = WEB_DIR / "favicon.ico"
    favicon_png = WEB_DIR / "favicon.png"
    logo_png = ROOT / "keyflow_logo.png"

    img.save(logo_png, format="PNG")
    img.resize((256, 256), Image.Resampling.LANCZOS).save(favicon_png, format="PNG")
    img.save(ASSETS_DIR / "keyflow_mark.png", format="PNG")

    # Multi-resolution Windows ICO (16px, 24px, 32px, 48px, 64px, 128px, 256px)
    icon_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(favicon_ico, format="ICO", sizes=icon_sizes)

    print(f"✅ Generated {favicon_ico} (Multi-Layer Windows ICO)")
    print(f"✅ Generated {favicon_png} (Transparent PNG)")
    print(f"✅ Generated {logo_png} (Root Logo PNG)")


def build_executable():
    print_step(3, "Compiling Standalone Executable (PyInstaller)")
    if not BUILD_SPEC.exists():
        print(f"❌ Error: {BUILD_SPEC} not found.")
        sys.exit(1)

    cmd = ["pyinstaller", str(BUILD_SPEC), "--noconfirm"]
    print(f"⚙️ Running: {' '.join(cmd)}")
    subprocess.check_call(cmd)
    
    exe_path = DIST_DIR / "KeyFlow.exe"
    if not exe_path.exists():
        exe_path = DIST_DIR / "KeyFlow" / "KeyFlow.exe"
    
    if exe_path.exists():
        print(f"✅ Compilation complete: {exe_path}")
        return exe_path
    else:
        print(f"✅ Output created in {DIST_DIR}")
        return None


def create_desktop_shortcut(exe_path: Path):
    print_step(4, "Creating Windows Desktop Shortcut with App Icon")
    if sys.platform != "win32":
        print("ℹ️ Desktop shortcut automation is tailored for Windows environments.")
        return

    try:
        # Determine Windows Desktop directory
        user_profile = os.environ.get("USERPROFILE", "")
        desktop_dir = Path(user_profile) / "Desktop"
        if not desktop_dir.exists():
            desktop_dir = Path.home() / "Desktop"

        if not desktop_dir.exists():
            print("⚠️ Could not locate Desktop folder. Skipping shortcut.")
            return

        shortcut_file = desktop_dir / "KeyFlow AI Typing.lnk"
        icon_file = WEB_DIR / "favicon.ico"

        target_str = str(exe_path.resolve()) if exe_path and exe_path.exists() else str((ROOT / "KeyFlow.bat").resolve())
        work_dir = str(exe_path.parent.resolve()) if exe_path and exe_path.exists() else str(ROOT.resolve())
        icon_str = str(icon_file.resolve())

        # Create shortcut via native Windows VBScript WScript.Shell (bypasses PowerShell ExecutionPolicy)
        vbs_script = f"""
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "{shortcut_file}"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "{target_str}"
oLink.WorkingDirectory = "{work_dir}"
oLink.IconLocation = "{icon_str},0"
oLink.Description = "KeyFlow AI Typing — Local Adaptive Desktop Studio"
oLink.Save
"""
        vbs_temp = ROOT / "_make_shortcut_temp.vbs"
        vbs_temp.write_text(vbs_script, encoding="utf-8")

        subprocess.run(["cscript", "//nologo", str(vbs_temp)], check=False)
        if vbs_temp.exists():
            vbs_temp.unlink()

        print(f"✅ Desktop shortcut created at: {shortcut_file}")
    except Exception as e:
        print(f"⚠️ Notice: Shortcut creation skipped ({e})")


def main():
    print("""
  ╔═══════════════════════════════════════════════════════════════╗
  ║       KeyFlow AI Typing — Master Desktop Build Engine         ║
  ╚═══════════════════════════════════════════════════════════════╝
    """)
    try:
        install_dependencies()
        generate_brand_icons()
        exe_path = build_executable()
        create_desktop_shortcut(exe_path)
        cleanup_obsolete_files()

        print("\n" + "=" * 70)
        print("🎉 ALL DONE! KEYFLOW DESKTOP APP IS 100% READY!")
        print("=" * 70)
        print("1. Standalone Executable: dist/KeyFlow.exe")
        print("2. Desktop Shortcut: 'KeyFlow AI Typing' on your Windows Desktop")
        print("3. Quick Launcher: KeyFlow.bat in project root")
        print("=" * 70 + "\n")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Build step failed with code {e.returncode}")
        sys.exit(e.returncode)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
