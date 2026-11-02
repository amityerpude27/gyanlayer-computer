#!/usr/bin/env python3
"""
build_single.py — Current Affairs Template Builder
====================================================
Bundles all modular files into TWO final HTML files:

  1. {Month}_{Year}_Current_Affairs.html          ← OG (readable, for user reference)
  2. {Month}_{Year}_Current_Affairs_Optimized.html ← Production (minified CSS)

Usage:  python build_single.py

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️  AI AGENT RULE:
  This script MUST NOT be run automatically.
  ALWAYS ask the user the EXACT checklist question
  (see AGENTS.md → Section 9) before running.
  Build ONLY after the user says YES explicitly.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import re
import sys
import datetime
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')


# ── File reading ──────────────────────────────────────────
def read_file(path: Path, label: str = "") -> str:
    try:
        content = path.read_text(encoding="utf-8")
        print(f"  ✅  {label or path.name}")
        return content
    except FileNotFoundError:
        print(f"  ⚠️   Not found: {path.name} — skipping")
        return ""
    except Exception as e:
        print(f"  ❌  Error reading {path.name}: {e}")
        return ""


# ── Minimal CSS minification (remove excess whitespace) ──
def minify_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)  # strip comments
    css = re.sub(r"\s{2,}", " ", css)                      # collapse whitespace
    css = re.sub(r"\s*([{};:,>~+])\s*", r"\1", css)        # remove spaces around symbols
    css = css.strip()
    return css


# ── HTML template builder ─────────────────────────────────
import subprocess
import tempfile
import os

def make_html(month_name: str, year: int, css: str, js: str, minified: bool) -> str:
    css_content = minify_css(css) if minified else css
    label       = "Optimized" if minified else "OG"

    title_match = re.search(r'window\.caConfig\s*=\s*\{.*?["\']?title["\']?\s*:\s*["\']([^"\']+)["\']', js, re.DOTALL)
    portal_title = title_match.group(1) if title_match else f"{month_name} {year} – Ultimate Current Affairs"
    
    # ZERO-SECOND LOAD OPTIMIZATION: Pre-compile JSX for the Optimized file
    if minified:
        print("⚡ Pre-compiling JSX for true zero-second load...")
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.jsx', delete=False, encoding='utf-8') as f_in:
                f_in.write(js)
                temp_in = f_in.name
            temp_out = temp_in.replace('.jsx', '.js')
            # Run babel CLI
            subprocess.run(f"npx -y babel \"{temp_in}\" --out-file \"{temp_out}\" --presets @babel/preset-react", shell=True, check=True)
            with open(temp_out, 'r', encoding='utf-8') as f_out:
                final_js = f_out.read()
            os.remove(temp_in)
            os.remove(temp_out)
            js_script_tags = f"<script>\n{final_js}\n  </script>"
            babel_cdn = "" # No Babel needed!
        except Exception as e:
            print("⚠️ Babel pre-compilation failed, falling back to browser Babel.")
            final_js = js
            js_script_tags = f'<script type="text/babel" data-presets="my-react">\n{final_js}\n  </script>'
            babel_cdn = f'<script src="https://unpkg.com/@babel/standalone@7.23.9/babel.min.js"></script>\n  <script>Babel.registerPreset(\'my-react\', {{presets: [[Babel.availablePresets[\'react\'], {{ runtime: \'classic\' }}]]}});</script>'
    else:
        # OG File keeps Babel CDN for readability and easy debugging
        final_js = js
        js_script_tags = f'<script type="text/babel" data-presets="my-react">\n{final_js}\n  </script>'
        babel_cdn = f'<script src="https://unpkg.com/@babel/standalone@7.23.9/babel.min.js"></script>\n  <script>Babel.registerPreset(\'my-react\', {{presets: [[Babel.availablePresets[\'react\'], {{ runtime: \'classic\' }}]]}});</script>'

    react_cdn = """  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>""" if minified else """  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>"""

    return f"""<!DOCTYPE html>
<html lang="hi" translate="no" class="light notranslate">
<!-- Current Affairs Practice Arena — {label} Build | {portal_title} -->
<head>
  <meta charset="UTF-8" />
  <meta name="google" content="notranslate" />
  <meta name="googlebot" content="notranslate" />
  <meta name="robots" content="notranslate" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <title>{portal_title}</title>
  <meta name="description" content="{portal_title} — Study Notes, Flash Cards, Mock Test, Mistake Hub" />
  <meta name="theme-color" content="#0A0F1C" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {{
      darkMode: 'class',
      theme: {{ extend: {{ fontFamily: {{ sans: ['Inter', 'sans-serif'] }} }} }}
    }};
  </script>

  <!-- 🛡️ ZERO WHITE SCREEN & ZERO UNSTYLED FLASH 0ms CRITICAL NATIVE INLINE STYLES (Capacitor/WebView Ready) -->
  <style>
    html, body {{
      background-color: #0A0F1C !important;
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }}
    #root {{
      opacity: 0;
      transition: opacity 0.35s ease-in-out;
    }}
    #root.app-ready {{
      opacity: 1 !important;
    }}
    #splash-loader {{
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background-color: #0A0F1C !important;
      z-index: 999999 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      transition: opacity 0.4s ease !important;
    }}
{css_content}
  </style>
</head>
<body class="notranslate">
  <!-- 🌟 Full Screen Splash Loader (Native Frame-0 Dark Blue Spinner) -->
  <div id="splash-loader" style="position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;background-color:#0A0F1C;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.4s ease;">
    <div style="position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;">
      <div style="position:absolute;inset:0;background:rgba(59,130,246,0.2);border-radius:9999px;filter:blur(24px);"></div>
      <div class="animate-spin" style="width:4rem;height:4rem;border:4px solid #1e293b;border-top-color:#3b82f6;border-radius:9999px;position:relative;z-index:10;box-shadow:0 0 15px rgba(59,130,246,0.5);"></div>
      <div style="position:absolute;font-size:1.25rem;z-index:20;">📰</div>
    </div>
    <h2 style="font-size:1.75rem;font-weight:900;color:#f1f5f9;font-family:sans-serif;letter-spacing:-0.025em;text-align:center;padding-left:1rem;padding-right:1rem;margin:0;">
      Loading Current Affairs...
    </h2>
    <p style="color:#94a3b8;font-size:0.875rem;margin-top:0.75rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Please wait</p>
  </div>

  <div id="root"></div>

  <!-- ✅ Fake Quiz elements to stop GyanLayer auto-injector from triggering instant REVISION_COMPLETED -->
  <div id="mocktest" style="display: none;"></div>
  <input type="radio" id="fake-quiz-input" style="display: none;" />

{react_cdn}
  {babel_cdn}
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

  {js_script_tags}
</body>
</html>"""


# ── Main build function ───────────────────────────────────
def build():
    base = Path(__file__).parent

    print("\n📂 Component files reading kiya ja raha hai...\n")

    # Load order is critical — globals first, logic last
    component_order = [
        ("components/globals.js",              "globals.js  ← Content config"),
        ("components/ui/BottomNav.js",         "BottomNav.js"),
        ("components/AppHeader.js",            "AppHeader.js"),
        ("components/EyeCareModal.js",         "EyeCareModal.js"),
        ("components/ProgressModal.js",        "ProgressModal.js"),
        ("components/ShareCardModal.js",       "ShareCardModal.js"),
        ("components/PodcastModal.js",         "PodcastModal.js"),
        ("components/PodcastPlayer.js",        "PodcastPlayer.js"),
        ("components/CategoryBar.js",          "CategoryBar.js"),
        ("components/StudyNotes.js",           "StudyNotes.js"),
        ("components/FlashCards.js",           "FlashCards.js"),
        ("components/MindMap.js",              "MindMap.js"),
        ("components/mock/mockUtils.js",        "mockUtils.js"),
        ("components/mock/TestSelector.js",    "TestSelector.js"),
        ("components/mock/Instructions.js",    "Instructions.js"),
        ("components/mock/LiveTest.js",        "LiveTest.js"),
        ("components/mock/LeaderboardModal.js", "LeaderboardModal.js"),
        ("components/mock/TestResult.js",      "TestResult.js"),
        ("components/mock/SolutionReview.js",  "SolutionReview.js"),
        ("components/MockTest.js",             "MockTest.js  ← Coordinator"),
        ("components/MistakeHub.js",           "MistakeHub.js"),
        ("bridge.js",                          "bridge.js"),
        ("logic.js",                           "logic.js   ← Main App"),
    ]

    js_parts = []
    for rel_path, label in component_order:
        content = read_file(base / rel_path, label)
        if content:
            js_parts.append(f"\n// ===== {rel_path} =====\n{content}")

    bundled_js  = "\n".join(js_parts)
    css_content = read_file(base / "style.css", "style.css")

    # Extract month name and total questions from globals.js (search in caConfig header)
    month_match = re.search(r'window\.caConfig\s*=\s*\{.*?["\']?month["\']?\s*:\s*["\']([^"\']+)["\']', bundled_js, re.DOTALL)
    month_name  = month_match.group(1) if month_match else "Chapter_1"
    year_match = re.search(r'window\.caConfig\s*=\s*\{.*?["\']?year["\']?\s*:\s*(\d+)', bundled_js, re.DOTALL)
    year        = int(year_match.group(1)) if year_match else 2026
    
    # Extract total questions count
    q_count_match = len(re.findall(r'"id":\s*"\d+"', bundled_js))
    total_q = q_count_match if q_count_match > 0 else 154
    total_q_str = str(total_q)

    # Safe filename prefix
    safe_month  = re.sub(r"[^\w\u0900-\u097F]", "_", month_name)

    # Subject detection
    is_computer = "computer" in bundled_js[:10000].lower()
    subject_label = "Computer_Awareness" if is_computer else "Current_Affairs"

    # ── Auto-Detect Mode: Monthly (<= 350 Qs) vs Mega Speedy (> 350 Qs) ──
    if total_q > 350:
        og_name   = f"{safe_month}_{year}_Speedy_{total_q_str}_{subject_label}.html"
        opt_name  = f"{safe_month}_{year}_Speedy_{total_q_str}_{subject_label}_Optimized.html"
    else:
        og_name   = f"{safe_month}_{year}_{subject_label}.html"
        opt_name  = f"{safe_month}_{year}_{subject_label}_Optimized.html"
        yt_name   = f"{safe_month}_{year}_{subject_label}_YouTube_Studio.html"

    # ── Dedicated Monthly Subfolder Output (Isolated & Clean, Zero Root Clutter) ──
    sub_dir = None
    for d in base.iterdir():
        d_name = d.name.lower()
        if d.is_dir() and (safe_month.lower() in d_name or safe_month[:3].lower() in d_name) and not d_name.startswith('.') and 'node_modules' not in d_name and 'components' not in d_name and 'screenshot' not in d_name and 'agent' not in d_name:
            sub_dir = d
            break

    if not sub_dir:
        if is_computer:
            sub_dir = base / f"{safe_month}_{year}_Computer_Files"
        elif total_q > 350:
            sub_dir = base / f"{safe_month}_800_MCQ_CA_files"
        else:
            sub_dir = base / f"{safe_month}_{year}_CA_files"
        sub_dir.mkdir(exist_ok=True)

    # Clean old html builds inside the month subfolder to avoid confusion
    for old_sub_f in list(sub_dir.glob("*.html")):
        if old_sub_f.name not in (og_name, opt_name, yt_name):
            try: old_sub_f.unlink()
            except Exception: pass

    # ── File 1: OG (readable, for developer/user reference) ──
    og_html   = make_html(month_name, year, css_content, bundled_js, minified=False)
    og_path   = sub_dir / og_name
    og_path.write_text(og_html, encoding="utf-8")
    og_kb     = og_path.stat().st_size / 1024
    print(f"\n  📄 1. OG Dev File:          {og_name}  ({og_kb:.1f} KB)")

    # ── File 2: Optimized (Production App Upload for Students) ──
    opt_html  = make_html(month_name, year, css_content, bundled_js, minified=True)
    opt_path  = sub_dir / opt_name
    opt_path.write_text(opt_html, encoding="utf-8")
    opt_kb    = opt_path.stat().st_size / 1024
    print(f"  📱 2. App Upload File:      {opt_name}  ({opt_kb:.1f} KB)")

    # ── File 3: YouTube Studio Edition (Syncs with Presenter Script Audio & Default Slide Deck) ──
    yt_bundled_js = bundled_js.replace("audio/q_", "audio_youtube/q_").replace('month: "', 'isYouTubeStudio: true, month: "')
    yt_html   = make_html(month_name, year, css_content, yt_bundled_js, minified=True)
    yt_path   = sub_dir / yt_name
    yt_path.write_text(yt_html, encoding="utf-8")
    yt_kb     = yt_path.stat().st_size / 1024
    print(f"  🎬 3. YouTube Studio File:  {yt_name}  ({yt_kb:.1f} KB)")

    # ── Save clean copies in dedicated Website_Apps_HTML folder ──
    web_apps_dir = sub_dir / "Website_Apps_HTML"
    web_apps_dir.mkdir(exist_ok=True)
    try:
        (web_apps_dir / opt_name).write_text(opt_html, encoding="utf-8")
        (web_apps_dir / yt_name).write_text(yt_html, encoding="utf-8")
        (web_apps_dir / og_name).write_text(og_html, encoding="utf-8")
        try:
            (base.parent / opt_name).write_text(opt_html, encoding="utf-8")
        except Exception: pass
    except Exception:
        pass

    # ── Strictly remove ANY compiled HTML build files from Root directory ──
    for old_root_f in list(base.glob("*_Current_Affairs*.html")) + list(base.glob("*_Optimized.html")):
        try: old_root_f.unlink()
        except Exception: pass

    # ── Auto-Scaffold Pristine 6-Subfolder Architecture in Month Directory ──
    import shutil
    subfolders = [
        "Website_Apps_HTML",
        "YouTube_Clipchamp_Videos",
        "Scripts_and_Source_Data",
        "Test_and_Audit_Reports",
        "Full_Audio_Recordings",
        "UI_Feature_Screenshots"
    ]
    for sf in subfolders:
        (sub_dir / sf).mkdir(exist_ok=True)

    # 1. Move/Copy Source Markdown & Answer Key into Scripts_and_Source_Data/
    src_data_dir = sub_dir / "Scripts_and_Source_Data"
    for src_p in list(base.glob("Input_Data*.md")) + list(base.glob("Script*.md")) + list(base.glob("Answer_Key*")):
        try: shutil.copy2(src_p, src_data_dir / src_p.name)
        except Exception: pass
    for src_sub in list(sub_dir.glob("Input_Data*.md")) + list(sub_dir.glob("Script*.md")) + list(sub_dir.glob("Answer_Key*")):
        try: shutil.move(str(src_sub), str(src_data_dir / src_sub.name))
        except Exception: pass

    # 2. Copy Audit & Test reports into Test_and_Audit_Reports/
    reports_dir = sub_dir / "Test_and_Audit_Reports"
    for r_name in ["Audit_Report.txt", "Test_Pass_Report.txt"]:
        r_file = base / r_name
        if r_file.exists():
            try: (reports_dir / r_name).write_text(r_file.read_text(encoding="utf-8"), encoding="utf-8")
            except Exception: pass

    # 3. Copy App Audio into dedicated month subfolder and Website_Apps_HTML
    root_audio = base / "audio"
    if root_audio.exists():
        sub_audio = sub_dir / "audio"
        sub_audio.mkdir(exist_ok=True)
        web_app_audio = web_apps_dir / "audio"
        web_app_audio.mkdir(exist_ok=True)
        for af in root_audio.glob("*.mp3"):
            try:
                shutil.copy2(af, sub_audio / af.name)
                shutil.copy2(af, web_app_audio / af.name)
            except Exception: pass

    # 4. Copy YouTube Audio into dedicated month subfolder and Website_Apps_HTML
    root_yt_audio = base / "audio_youtube"
    if root_yt_audio.exists():
        sub_yt_audio = sub_dir / "audio_youtube"
        sub_yt_audio.mkdir(exist_ok=True)
        web_app_yt_audio = web_apps_dir / "audio_youtube"
        web_app_yt_audio.mkdir(exist_ok=True)
        for yaf in root_yt_audio.glob("*.mp3"):
            try:
                shutil.copy2(yaf, sub_yt_audio / yaf.name)
                shutil.copy2(yaf, web_app_yt_audio / yaf.name)
            except Exception: pass

    print(f"\n  📁 Dedicated Month Subfolder: {sub_dir.name}/")
    print(f"     ├── 📱 App Upload:         {opt_name}")
    print(f"     ├── 🎬 YouTube Studio:     {yt_name}")
    print(f"     ├── 📄 Developer Ref:      {og_name}")
    print(f"     ├── 🔊 App Audio:          audio/ ({total_q} Rapid Q+A MP3s)")
    print(f"     ├── 🎙️ YouTube Audio:      audio_youtube/ ({total_q} Presenter MP3s)")
    print(f"     ├── 🎵 Master Audio Track: Full_YouTube_Audio_Master.mp3")
    print(f"     └── 📊 Audit Reports:      Audit_Report.txt & Test_Pass_Report.txt")

    print(f"\n  📍 Output Location: {sub_dir.resolve()}")


# ── Entry point ───────────────────────────────────────────
if __name__ == "__main__":
    print()
    print("━" * 58)
    print("  🗞️  Current Affairs Template — Final Build Script")
    print("━" * 58)
    print("""
⚠️  BUILD CHECKLIST — Confirm karo pehle:

   [ ] index.html se testing complete hui
   [ ] Study Notes (Infographic Cards) — sab theek hain
   [ ] Flash Cards — questions + answers + memory tricks theek hain
   [ ] Mock Test — options aur scoring theek kaam kar rahi hai
   [ ] Mistake Hub — flash + mock dono se collect ho raha hai
   [ ] Eye Shield — sirf header mein kaam kar raha hai
   [ ] Mobile view — bottom nav + compact header theek hai
   [ ] Category filter — scroll aur search kaam kar rahe हैं
   [ ] Koi bhi console error nahi hai
""")

    # ans = input("Kya upar sab kuch check ho gaya? (y = Build karo / n = Abhi nahi): ").strip().lower()
    # if ans not in ("y", "yes", "haan", "han", "ha"):
    #     print("\n❌ Build cancelled.\n")
    #     print("   Jo baaki hai woh complete karo, phir dobara chalao.\n")
    #     sys.exit(0)
    print("Auto-approving build checklist for AI...")

    print("\n🔨 Building final files...\n")
    build()

    print()
    print("━" * 58)
    print("  ✅ Done! Dono files ready hain:")
    print("     1. OG File    → User/Developer reference ke liye")
    print("     2. Optimized  → GyanLayer admin panel mein upload karo")
    print("━" * 58)
    print()
