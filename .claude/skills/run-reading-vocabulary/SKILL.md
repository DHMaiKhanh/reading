---
name: run-reading-vocabulary
description: Render, preview, and screenshot the Reading Vocabulary study HTML pages (e.g. Art_Reading_Vocabulary_Detailed.html). Use to run, open, view, preview, or take a screenshot of a reading-analysis / vocabulary HTML document and verify it renders correctly.
---

# Run: Reading Vocabulary study pages

This "project" is a set of **self-contained static HTML study documents**
(English reading passages analyzed into per-paragraph bilingual translation +
detailed vocabulary tables). There is no server and no build step — each
`*.html` file is opened directly in a browser.

"Running" one means **rendering it in headless Chrome and saving a full-page
PNG** so you can confirm it displays correctly (fonts, colored boxes, vocab
tables). The driver is
[.claude/skills/run-reading-vocabulary/driver.mjs](.claude/skills/run-reading-vocabulary/driver.mjs).

All paths below are relative to the unit root: `d:\English\Reading_Vocabulary`.

## Prerequisites

- **Node.js >= 22** (uses the built-in global `WebSocket`). Verified with
  `node --version` → `v24.15.0`. No `npm install` — the driver has zero
  dependencies.
- **Google Chrome** (or Edge). The driver auto-detects
  `C:\Program Files\Google\Chrome\Application\chrome.exe` and the Edge
  fallback. Override with the `CHROME_PATH` env var if installed elsewhere.

Nothing to install on this machine — both were already present.

## Run (agent path)

Render the default page (the first `*.html` in the unit root):

```powershell
node ".\.claude\skills\run-reading-vocabulary\driver.mjs"
```

Render a specific file to a specific output PNG (use this — there are
multiple `*.html` files, so don't rely on the default pick):

```powershell
node ".\.claude\skills\run-reading-vocabulary\driver.mjs" ".\Art_Reading_Vocabulary_Detailed.html" ".\.claude\skills\run-reading-vocabulary\render-Detailed.png"
```

On success it prints e.g. `[driver] OK 1200x7075 -> <output>.png`. The PNG is a
**true full-page capture** — the driver reads the page's real content height via
the DevTools Protocol, so a 12,000px-tall document is captured whole, not
clipped to a window. **Open the PNG and look at it** to confirm it isn't blank.

- Default output: `render-<input-name>.png` inside the skill directory.
- Render width defaults to 1200px (good for the wide vocab tables). Override
  with the `RV_WIDTH` env var, e.g. `$env:RV_WIDTH=900`.

## Run (human path)

Just open the file in a browser — it's a plain static page:

```powershell
Invoke-Item ".\Art_Reading_Analysis.html"
```

This opens your default browser. Useless for automated verification (no
screenshot, no exit signal) — use the driver above for that.

## Editing the source files

The `.html` files are hand-authored study sheets. Their companion `.docx`
files are separate exports — editing the HTML does **not** update the `.docx`.
The page is `lang="vi"`, all styling is inline in a `<style>` block, and the
content uses these CSS classes: `.en` (English source, blue box), `.vi`
(Vietnamese translation, amber box), `.tip` (green), `.ans` (red), plus vocab
`<table>`s. Keep that markup convention when adding passages.

## Gotchas

- **Chrome is not on `PATH`.** Calling `chrome` bare fails; the driver uses the
  full `Program Files` path. If you invoke Chrome yourself, use the absolute
  `.exe` path or `CHROME_PATH`.
- **Don't guess a fixed window height.** A static `--window-size=1200,6000`
  Chrome screenshot silently clips: the real documents here are 7,075px and
  12,383px tall. The driver instead queries `Page.getLayoutMetrics`
  (`cssContentSize`) and captures with `captureBeyondViewport: true`.
- **PowerShell prints a red `NativeCommandError`** when you call
  `chrome.exe ...` directly, even on success — it's PowerShell wrapping
  Chrome's normal stderr, not a real failure. The Node driver avoids this by
  running Chrome with `stdio: 'ignore'`.
- **Default file pick is order-dependent.** With several `*.html` present the
  no-arg run picks `readdirSync`'s first entry. Pass the filename explicitly
  when you care which one renders.

## Troubleshooting

- `No input given and no *.html found` → you're not in the unit root, or the
  file moved. `cd d:\English\Reading_Vocabulary` first, or pass an explicit path.
- `No Chrome/Edge found` → set it: `$env:CHROME_PATH="C:\path\to\chrome.exe"`.
- `Chrome DevTools endpoint never came up` → another Chrome with the same
  `--user-data-dir` or a locked profile; the driver uses a fresh temp profile
  and a random debug port, so just re-run. If it persists, close stray
  `chrome.exe --headless` processes.
