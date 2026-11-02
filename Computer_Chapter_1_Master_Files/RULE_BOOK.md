# 📚 GyanLayer Computer Awareness Master Rule Book


---

## 💻 106. Computer Awareness & Subject-Wise Exam Chapter Transformation Protocol (Mandatory Rule)

When adapting the GyanLayer Master Engine from Current Affairs to Computer Awareness or any subject-wise exam chapter (e.g., RRB NTPC Graduate Level GL & Undergraduate UG, Railway, SSC, State Exams):

### 1. Dynamic Mode Configuration (`globals.js`):
- `mode: 'chapter'` (instead of `'monthly'`).
- `title: "RRB NTPC & SSC 2026 – Ultimate Computer Awareness"` (or subject title).
- `month: "Chapter 1"` (represents chapter identifier).
- `subtitle: "Chapter X: [Topic Name] • [Count] Latest TCS PYQs with Memory Tricks"`.
- `appLogo: "💻"`.
- Explanations: `explanation: null` when 360° explanations are not present (zero empty toggle boxes).

### 2. Standardized Short Exam & Level Badges:
- Date string in `globals.js` question items MUST follow clean, short, standardized badging:
  - Graduate Level: `RRB NTPC GL • Mar 2026`
  - Undergraduate Level: `RRB NTPC UG • May-Jun 2026`
  - Stage-1 / Older PYQs: `RRB NTPC Stage-1 • Jan 2021` / `RRB NTPC • 2016`
- Zero long paragraph dates inside top badges. Clean, short, and 100% visible across mobile and desktop.

### 3. Shift / Repeat Info Tagging (`shiftInfo`):
- Extracted tags from PYQ metadata (`📌 3 Shifts Repeat`, `🔁 Variant 2`, `📌 Base Question`, `⚡ Shift-II`).
- Placed in the open space next to the `Mark Read` button in the card bottom action bar.
- Compact padding (`px-2 sm:px-2.5`) with hover tooltips displaying full raw exam and shift dates.

### 4. Memory Trick Purity Standard:
- All memory tricks MUST be 100% clean, punchy, and free of redundant category text.
- Suffixes like `🔥 **Category 1: ...**` MUST BE STRIPPED during data parsing.

### 5. Category Emojis & Icon System:
- Every category in `categories_def` must include a dedicated emoji (`💡`, `⚠️`, `⏳`, `📜`, `🚀`, `🏗️`, `⚡`, `🔄`, `🖲️`, `🚌`, `🧠`, `⚙️`, `📊`, `🧩`, `🔌`).
- Category badges in `StudyNotes.js` (header pill and single-card focus view) must render the category emoji alongside the category label.

### 6. Card Symmetry & Equal Height Architecture:
- `flex-1` on question container with balanced `min-h-[5rem] sm:min-h-[5.5rem]`.
- Fixed/proportional height on Answer box (`h-[4rem] sm:h-[4.25rem]`).
- Fixed/proportional height on Memory Trick box (`h-[4.25rem] sm:h-[4.5rem]`).
- Snug bottom action bar with `mt-auto pt-0.5` so all cards in a grid row share identical height and horizontal alignment with ZERO awkward empty gaps.

### 7. Sectional Mock Tests & Recency Prioritization:
- **Tab Name:** `Sectional Test` (instead of `Monthly Mock` or `Chapter Mock`).
- **Test Names:** `Sectional Mock Test 1`, `Sectional Mock Test 2`, etc.
- **Card Badges:** `ST 1`, `ST 2`, `ST 3`, etc.
- **Recency Prioritization:** All questions are partitioned in strictly DESCENDING ORDER of exam year:
  - 2026 Latest PYQs fill Test 1 and start Test 2.
  - 2025 PYQs fill Test 2 and Test 3.
  - Older PYQs fill subsequent tests.
- **Zero Question Overlap:** No question appears in more than one Sectional Mock Test.
- **Live CBT Randomization:** Deterministic shuffle applied within each 25-question set for realistic exam simulation.

### 8. Solution Review User Choice Indicator (`You (U)`):
- In `SolutionReview.js`, when a student selects an incorrect option:
  - Option card gets a rose/red border and red background.
  - Option letter bubble turns solid red with white text.
  - On the right, a prominent badge displays `[✕ You (U)]`.
- Correct answers display `[✓ Correct Ans]` (or `[✓ Correct (You)]` if student answered correctly).

### 9. Production Compilation Standard:
- Must always be compiled through Babel CLI offline JSX pre-compilation (`build_single.py`) into `_Optimized.html`.
- True 0-second instant load without in-browser Babel overhead.

### 10. Sequence-Wise Master Folder Structure:
- `01_Website_Apps_HTML/` (Production HTML and Developer HTML)
- `02_Source_and_Raw_Data/` (Task 0 and Task 1 markdown source files)
- `03_Core_Components_and_Code/` (components, logic, bridge, style, build scripts)
- `04_Verification_and_Screenshots/` (Playwright E2E verification screenshots)
- `05_Audio_and_Media/` (audio, audio_youtube)
- `06_Audit_and_Reports/` (Audit reports, pass logs, and Rule Book)


---

## 🎙️ 107. Dedicated Subject-Specific Audio Repository & Voice Modulation Standard

1. **Dedicated Repository Isolation:**
   - Subject-specific audio files MUST NEVER be mixed into the Current Affairs repository (`gyanlayer-ca-audio-2026`).
   - Every subject receives its own dedicated GitHub repository:
     - e.g., `https://github.com/amityerpude27/gyanlayer-computer-audio.git`
   - Subfolder structure within repo: `Chapter_1/`, `Chapter_2/`, etc.
   - Individual question audio files: `Chapter_1/q_1.mp3`, `Chapter_1/q_2.mp3`, ...
   - Single master continuous audio: `Chapter_1/Computer_Chapter_1_Master_Audio.mp3`.

2. **Voice & Speed Modulation Standards:**
   - **Engine:** Microsoft Edge Neural TTS (`edge-tts`).
   - **Voice:** `hi-IN-MadhurNeural` (Educator / Calm Indian Hindi).
   - **Speed Rate:** Strictly normal natural speed `RATE = "+0%"` (1.0x tempo). Never sped up or rushed, ensuring 100% natural, clear pronunciation of English computer terminology alongside Hindi explanations.
   - **Content Format:** Question in Hindi + 4 Options (A, B, C, D) + Correct Answer + Memory Trick (Speedy rapid revision).
   - **Master Continuous Podcast:** Combined continuous track with clean 0.6s silence padding between questions for effortless hands-free listening.

3. **High-Speed Global CDN Integration:**
   - Base CDN URL: `https://cdn.jsdelivr.net/gh/amityerpude27/gyanlayer-computer-audio@main/Chapter_1/`
   - Configured in `globals.js` via `audioBaseUrl: 'https://cdn.jsdelivr.net/gh/amityerpude27/gyanlayer-computer-audio@main/Chapter_1/'`.
   - Local fallback: Automatic fallback to `./audio/q_{id}.mp3` for offline zero-latency playback.

---

## 🧪 108. Solution Review Screen Audit & Defect-Detection Testing Protocol (Benchmark Match)

1. **Full 20-Test Automated Examination:**
   - All 6 Sectional Mock Tests (`ST 1` to `ST 6`) and all 14 Topic-Wise Tests (`TT 1` to `TT 14`) MUST undergo full automated end-to-end examination and solution review verification.
   - Total Tests: Exactly 20 Tests.

2. **Mandatory Defect Detection Rule ("Agar galat nikalta hai toh turant batana hai"):**
   - Before test submission, verify dataset integrity: every `q.answer` must be non-empty and must strictly match one of the items in `q.options`.
   - During solution review verification, `Incorrect (0)` and `Unattempted (0)` must be guaranteed across 100% of tested questions.
   - If any question fails or is flagged as incorrect, the test runner must immediately report the exact question ID, text, expected answer, and selected option.

3. **Solution Review Screen UI Layout (100% Match with Benchmark Image):**
   - **Header Bar:** Shows `← Go to Tests`, `📊 Analysis`, Test Title (e.g. `Sectional Mock Test 1`, `Characteristics — Topic Test`), `gyanlayer.in` badge, `Attempt 1` dropdown, and `FILTER` button.
   - **Quick Filters Bar:** Solid pills showing `All (N)`, `Correct (N)`, `Incorrect (0)`, `Unattempted (0)`.
   - **Inside Question Solution Panel (First Page):**
     - `Question No. 1` header with green badge `Correct` (+1 mark).
     - Full Hindi question text.
     - 4 option cards, with the correct option highlighted with a vibrant green border (`border-emerald-500` / `#16a34a`) and solid green radio bubble.
     - Bottom explanation drawer toggle: `📖 View 360° Explanation / Memory Trick`.
   - **Right-Hand Palette:**
     - 5-column grid showing all question numbers (1 to N).
     - Every single attempted correct question MUST be a solid green box (`#dcfce7` background, `#86efac` border, `#16a34a` text).
     - 0 red boxes, 0 gray unattempted boxes.
   - **Speed Indicators & Metrics:** Superfast (< 6s) / On Time (<= 11s) indicators rendered cleanly at bottom right.

4. **Standardized Screenshot Evidence:**
   - Full-width high-resolution viewport screenshots (1440x950) saved to:
     `Computer_Chapter_1_Master_Files/04_Verification_and_Screenshots/`
   - Naming convention:
     - `01_ST_{num}_Sectional_Mock_Test_{num}_Solution_Panel.png` (ST 1 to ST 6)
     - `02_TT_{num}_Topic_Wise_Test_{num}_{topic_slug}_Solution_Panel.png` (TT 1 to TT 14)
