<div align="center">

  <h1>⚡ YouTube Ceramic Speed</h1>
  <p><strong>A high-performance YouTube playback controller with a White Ceramic Glass aesthetic.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Platform-YouTube-red?style=for-the-badge&logo=youtube" alt="YouTube" />
    <img src="https://img.shields.io/badge/Speed_Range-0.25x_--_16x-white?style=for-the-badge&logo=speedtest" alt="Speed Range" />
    <img src="https://img.shields.io/badge/UI_Theme-White_Ceramic_Glass-lightgrey?style=for-the-badge" alt="Ceramic Glass" />
    <img src="https://img.shields.io/badge/Format-Chrome_Extension-blue?style=for-the-badge&logo=googlechrome" alt="Chrome Extension" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-keyboard-shortcuts">Shortcuts</a> •
    <a href="#-installation-guide">Installation Guide</a> •
    <a href="#-folder-structure">Folder Structure</a> •
    <a href="#-configuration">Configuration</a>
  </p>

</div>

---

## 🌟 Overview

**YouTube Ceramic Speed** is a browser extension that gives you precision speed control over any YouTube video. Styled with a **White Ceramic Glass** design (frosted diffusion, crisp specular rims, and soft drop shadows), it integrates naturally into YouTube's native player bar without visual clutter.

Whether you're blasting through lectures at **16x**, analyzing details at **0.25x**, or holding **`G`** to breeze past sponsored segments, you get instantaneous hotkey speed control with zero latency.

---

## ✨ Key Features

- **🥛 White Ceramic Glass UI**: Frosted translucent menus, polished porcelain action buttons, and glowing white active indicators.
- **⚡ Exponential Hotkeys**: Double (`2x`) or halve (`0.5x`) playback speeds with single keypresses.
- **🚀 Hold-G Turbo Boost**: Hold <kbd>G</kbd> to blast ahead at your chosen boost rate (default `4x`); release to instantly return to your original speed.
- **🎯 1x Clean-Slate Navigation**: Never get stuck watching a new video in slow-motion. Every newly opened video automatically defaults to `1x`.
- **🎛️ Control-Bar Menu**: Embedded directly into the YouTube player bar beside the settings cog. Features quick presets (`2x`, `4x`, `8x`, `10x`, `16x`), a custom decimal speed input, and Hold-G speed settings.
- **🛡️ Typing Protection**: Hotkeys are automatically disabled when typing in search bars, comment boxes, or live chats.
- **🖥️ Fullscreen Ready**: Speed HUD badges adapt and display cleanly in full-screen mode.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Multiplier / Range |
| :--- | :--- | :--- |
| <kbd>Shift</kbd> + <kbd>}</kbd> | **Speed Up** | Multiplies speed by **2x** *(Max: `16x`)* |
| <kbd>Shift</kbd> + <kbd>{</kbd> | **Slow Down** | Divides speed by **2x** *(Min: `0.25x`)* |
| <kbd>Hold G</kbd> | **Turbo Boost** | Temporarily boosts speed *(Default: `4x`)* |
| <kbd>Release G</kbd> | **Restore** | Returns immediately to previous speed |
| <kbd>Esc</kbd> | **Close Menu** | Closes the speed selector panel |

> *Note: Shortcuts are never triggered while typing in any text box or comment area.*

---

## 📥 Installation Guide

Works on all Chromium browsers: **Google Chrome**, **Brave**, **Microsoft Edge**, **Opera**, and **Vivaldi**.

### Step 1: Download the ZIP
1. Click the green **`<> Code`** button at the top of this repository.
2. Select **Download ZIP**.
3. Locate the downloaded file and **extract it** to a permanent folder on your computer.

### Step 2: Open Extensions in Your Browser
Open a new tab and go to your browser's extension management page:
- **Chrome / Brave**: `chrome://extensions/`
- **Microsoft Edge**: `edge://extensions/`
- **Opera**: `opera://extensions/`

### Step 3: Enable Developer Mode
Look in the top-right corner of the Extensions page and toggle on **Developer mode**.

### Step 4: Load the Extension
1. Click the **Load unpacked** button (top-left).
2. Select the extracted folder containing `manifest.json` and `content.js`.
3. Open or refresh any [YouTube](https://www.youtube.com/) tab and enjoy!

---

## 📁 Folder Structure

Your extracted folder should look like this:

```text
youtube-ceramic-speed/
├── manifest.json    # Extension manifest (MV3)
├── content.js       # Core engine, shortcuts, and ceramic styles
└── README.md        # Documentation
```

---

## ⚙️ Configuration

Want to adjust preset rates, the default Hold-G boost speed, or change keybindings? Edit the `Config` section near the top of `content.js`:

```javascript
/* ================= Config ================= */
const HOLD_CODE = "KeyG";          // Physical key code for hold-boost
const DEFAULT_HOLD_RATE = 4;       // Default speed when holding G
const PRESETS = [2, 4, 8, 10, 16]; // Quick preset row buttons
const SHORTCUT_MIN_RATE = 0.25;    // Minimum step for Shift + {
const SHORTCUT_MAX_RATE = 16;      // Maximum step for Shift + }
```

After modifying `content.js`, simply click the **refresh icon** 🔄 on this extension at `chrome://extensions/`.

---

## 🎨 Design Spec

```
Surface:          Deep Tint Ceramic Glass (rgba(18, 20, 24, 0.82))
Backdrop Filter:  blur(28px) saturate(180%)
Bevel Specular:   border-top: 1px solid rgba(255, 255, 255, 0.42)
Active Element:   Porcelain Ceramic Gradient (#FFFFFF -> #ECEFF3)
Shadows:          Multi-layered ambient diffusion + rim inner-glow
```

---
