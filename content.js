(() => {
  /* ================= Config ================= */
  const HOLD_CODE = "KeyG";
  const DEFAULT_HOLD_RATE = 4;
  const PRESETS = [2, 4, 8, 10, 16];
  const MIN_RATE = 0.0625; // Chrome's absolute lower limit
  const MAX_RATE = 16;
  const SHORTCUT_MIN_RATE = 0.25; // Shortcut lower limit
  const SHORTCUT_MAX_RATE = 16;   // Shortcut upper limit
  const STORE_KEY_CUSTOM = "yths-custom-rate";
  const STORE_KEY_HOLD = "yths-hold-rate";

  /* ================= Helpers ================= */
  const same = (a, b) => Math.abs(a - b) < 1e-6;
  const fmt = (r) => `${Number(r.toFixed(2))}x`;

  const getVideo = () => {
    const vids = [...document.querySelectorAll("video")];
    return (
      vids.find((v) => v.classList.contains("html5-main-video") && v.readyState > 0) ||
      vids.find((v) => !v.paused && v.readyState > 0) ||
      vids.find((v) => v.readyState > 0) ||
      vids[0] ||
      null
    );
  };

  const isTyping = (el) => {
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  };

  const readStorageRate = (key, fallback = null) => {
    try {
      const v = parseFloat(localStorage.getItem(key));
      return isFinite(v) && v > 0 ? Math.min(MAX_RATE, Math.max(MIN_RATE, v)) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveStorageRate = (key, v) => {
    try {
      localStorage.setItem(key, String(v));
    } catch {}
  };

  const getHoldRate = () => readStorageRate(STORE_KEY_HOLD, DEFAULT_HOLD_RATE);

  /* ================= Hold-G boost & Floating Badge ================= */
  let holdActive = false;
  let activeHoldRate = DEFAULT_HOLD_RATE;
  let originalRate = 1;
  let holdTimer = null;
  let holdVideo = null;
  let holdBadge = null;
  let toastTimer = null;

  const showBadge = (rate) => {
    if (!holdBadge) {
      holdBadge = document.createElement("div");
      holdBadge.id = "yths-badge";
    }
    holdBadge.innerHTML = `<span>${fmt(rate)}</span><span class="yths-badge-arrows">▶▶</span>`;
    (document.fullscreenElement || document.body).appendChild(holdBadge);
  };

  const showToast = (rate) => {
    if (holdActive) return;
    showBadge(rate);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (!holdActive && holdBadge) {
        holdBadge.remove();
        holdBadge = null;
      }
    }, 700);
  };

  const enforceHold = () => {
    if (holdActive && holdVideo && !same(holdVideo.playbackRate, activeHoldRate)) {
      holdVideo.playbackRate = activeHoldRate;
    }
  };

  const startHold = () => {
    if (holdActive) return;
    holdVideo = getVideo();
    if (!holdVideo) return;
    holdActive = true;
    activeHoldRate = getHoldRate();
    originalRate = holdVideo.playbackRate;
    holdVideo.playbackRate = activeHoldRate;
    holdVideo.addEventListener("ratechange", enforceHold);
    holdTimer = setInterval(enforceHold, 100);
    showBadge(activeHoldRate);
  };

  const stopHold = () => {
    if (!holdActive) return;
    holdActive = false;
    clearInterval(holdTimer);
    if (holdVideo) {
      holdVideo.removeEventListener("ratechange", enforceHold);
      holdVideo.playbackRate = originalRate;
    }
    holdVideo = null;
    if (holdBadge) {
      holdBadge.remove();
      holdBadge = null;
    }
  };

  /* ================= Player-bar speed menu ================= */
  let btn = null;
  let btnLabel = null;
  let menu = null;
  let rows = [];

  const currentRate = () => {
    const v = getVideo();
    return v ? v.playbackRate : 1;
  };

  const setRate = (r) => {
    r = Math.min(MAX_RATE, Math.max(MIN_RATE, r));
    const v = getVideo();
    if (v) v.playbackRate = r;
    updateUI();
  };

  // Resets rate back to default 1x
  const resetToDefaultRate = () => {
    const v = getVideo();
    if (v && !holdActive) {
      v.playbackRate = 1;
    }
    updateUI();
  };

  const refreshMenu = () => {
    const r = currentRate();
    rows.forEach(({ el, test }) => {
      const active = test(r);
      el.classList.toggle("active", active);
      const mark = el.querySelector(".yths-check");
      if (mark) mark.style.opacity = active ? "1" : "0";
    });
  };

  const updateUI = () => {
    const r = currentRate();
    if (btnLabel) {
      btnLabel.textContent = fmt(r);
      if (same(r, 1)) {
        btnLabel.classList.remove("active");
      } else {
        btnLabel.classList.add("active");
      }
    }
    refreshMenu();
  };

  const closeMenu = () => {
    if (menu) menu.style.display = "none";
  };
  const menuOpen = () => menu && menu.style.display !== "none";

  const addStyles = () => {
    if (document.getElementById("yths-style")) return;
    const s = document.createElement("style");
    s.id = "yths-style";
    s.textContent = `
      /* YouTube Player Control Button Sizing & Polish */
      #yths-btn {
        width: auto !important;
        min-width: 46px !important;
        height: 100% !important;
        padding: 0 6px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        vertical-align: top !important;
        box-sizing: border-box !important;
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        gap: 5px !important;
        opacity: 0.9;
        transition: opacity 0.15s ease;
      }

      #yths-btn:hover {
        opacity: 1;
      }

      #yths-btn svg {
        flex-shrink: 0;
        filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
      }

      /* Player-bar Ceramic Glass Pill Badge */
      .yths-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 7px;
        line-height: 1.25;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.22);
        box-shadow:
          inset 0 1px 1px rgba(255, 255, 255, 0.35),
          0 2px 6px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        font: 600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: rgba(255, 255, 255, 0.95);
        letter-spacing: 0.2px;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        white-space: nowrap;
        user-select: none;
      }

      .yths-pill.active {
        background: linear-gradient(145deg, #ffffff 0%, #eceff3 100%);
        color: #111317;
        border-color: rgba(255, 255, 255, 0.95);
        box-shadow:
          0 0 12px rgba(255, 255, 255, 0.45),
          0 2px 8px rgba(0, 0, 0, 0.4),
          inset 0 1px 1px #ffffff;
        font-weight: 700;
      }

      /* White Ceramic Glass Menu */
      #yths-menu {
        position: absolute;
        right: 12px;
        bottom: 58px;
        z-index: 2500;
        min-width: 220px;
        padding: 8px;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.04) 100%), rgba(18, 20, 24, 0.82);
        backdrop-filter: blur(28px) saturate(180%);
        -webkit-backdrop-filter: blur(28px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-top: 1px solid rgba(255, 255, 255, 0.42);
        border-radius: 18px;
        box-shadow:
          0 20px 48px rgba(0, 0, 0, 0.6),
          0 4px 12px rgba(0, 0, 0, 0.35),
          inset 0 1px 1px rgba(255, 255, 255, 0.42),
          inset 0 0 14px rgba(255, 255, 255, 0.05);
        color: #f5f6f8;
        font: 400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: none;
        animation: yths-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes yths-pop {
        from { opacity: 0; transform: translateY(6px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      #yths-menu .yths-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 11px;
        border-radius: 10px;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        border: 1px solid transparent;
      }

      #yths-menu .yths-row:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      #yths-menu .yths-row.active {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.09) 100%);
        border-color: rgba(255, 255, 255, 0.38);
        color: #ffffff;
        font-weight: 600;
        box-shadow:
          inset 0 1px 1px rgba(255, 255, 255, 0.38),
          0 2px 8px rgba(0, 0, 0, 0.25);
      }

      #yths-menu .yths-check {
        font-size: 10px;
        color: #ffffff;
        opacity: 0;
        transition: opacity 0.15s ease;
        text-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
      }

      #yths-menu .yths-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
        margin: 6px 4px;
      }

      #yths-menu .yths-section-title {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        color: rgba(255, 255, 255, 0.5);
        padding: 4px 11px 2px 11px;
        font-weight: 600;
      }

      #yths-menu .yths-input-row {
        cursor: default;
        padding: 5px 11px;
      }

      #yths-menu .yths-input-row:hover {
        background: none;
      }

      #yths-menu input {
        width: 48px;
        padding: 4px 6px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.36);
        color: #ffffff;
        font: 600 12px inherit;
        text-align: center;
        outline: none;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      #yths-menu input:focus {
        border-color: rgba(255, 255, 255, 0.7);
        box-shadow:
          0 0 0 2px rgba(255, 255, 255, 0.22),
          inset 0 1px 2px rgba(0, 0, 0, 0.4);
      }

      /* Ceramic Set / Save Action Buttons */
      #yths-menu .yths-set {
        margin-left: 6px;
        padding: 4px 11px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        border-radius: 8px;
        background: linear-gradient(145deg, #ffffff 0%, #e6eaef 100%);
        color: #121418;
        font: 600 11px inherit;
        cursor: pointer;
        box-shadow:
          0 2px 8px rgba(0, 0, 0, 0.3),
          inset 0 1px 1px #ffffff;
        transition: filter 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
      }

      #yths-menu .yths-set:hover {
        filter: brightness(1.06);
        box-shadow:
          0 4px 14px rgba(255, 255, 255, 0.25),
          0 2px 6px rgba(0, 0, 0, 0.35),
          inset 0 1px 1px #ffffff;
      }

      #yths-menu .yths-set:active {
        transform: scale(0.96);
      }

      /* Ceramic Glass Top Badge (Hold G / Shortcuts) */
      #yths-badge {
        position: fixed;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        padding: 7px 18px;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%), rgba(18, 20, 24, 0.82);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-top: 1px solid rgba(255, 255, 255, 0.48);
        box-shadow:
          0 18px 42px rgba(0, 0, 0, 0.65),
          0 4px 10px rgba(0, 0, 0, 0.35),
          inset 0 1px 1px rgba(255, 255, 255, 0.45);
        color: #ffffff;
        font: 600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        border-radius: 9999px;
        z-index: 2147483647;
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 6px;
        animation: yths-badge-pop 0.16s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes yths-badge-pop {
        from { transform: translateX(-50%) scale(0.92); opacity: 0; }
        to { transform: translateX(-50%) scale(1); opacity: 1; }
      }

      #yths-badge .yths-badge-arrows {
        color: #ffffff;
        font-size: 13px;
        letter-spacing: 1px;
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
      }
    `;
    document.head.appendChild(s);
  };

  const buildMenu = () => {
    addStyles();
    menu = document.createElement("div");
    menu.id = "yths-menu";
    ["click", "mousedown", "dblclick", "contextmenu"].forEach((t) =>
      menu.addEventListener(t, (e) => e.stopPropagation())
    );

    const addRow = (text, rate, test) => {
      const el = document.createElement("div");
      el.className = "yths-row";
      const lbl = document.createElement("span");
      lbl.textContent = text;
      const check = document.createElement("span");
      check.className = "yths-check";
      check.textContent = "●";
      el.append(lbl, check);

      el.addEventListener("click", () => {
        setRate(test(currentRate()) && rate !== 1 ? 1 : rate);
        closeMenu();
      });
      menu.appendChild(el);
      rows.push({ el, test });
    };

    // Preset options
    addRow("Normal (1x)", 1, (r) => same(r, 1));
    PRESETS.forEach((p) => addRow(`${p}x`, p, (r) => same(r, p)));

    // Divider
    const div1 = document.createElement("div");
    div1.className = "yths-divider";
    menu.appendChild(div1);

    // Custom playback speed row
    const custom = document.createElement("div");
    custom.className = "yths-row yths-input-row";
    const customLbl = document.createElement("span");
    customLbl.textContent = "Custom";
    const customControls = document.createElement("span");
    const customInput = document.createElement("input");
    customInput.type = "number";
    customInput.min = String(MIN_RATE);
    customInput.max = String(MAX_RATE);
    customInput.step = "0.25";
    customInput.value = String(readStorageRate(STORE_KEY_CUSTOM, 3));
    const customSetBtn = document.createElement("button");
    customSetBtn.className = "yths-set";
    customSetBtn.textContent = "Set";

    const applyCustom = () => {
      const v = parseFloat(customInput.value);
      if (!isFinite(v) || v <= 0) return;
      const clamped = Math.min(MAX_RATE, Math.max(MIN_RATE, v));
      customInput.value = String(clamped);
      saveStorageRate(STORE_KEY_CUSTOM, clamped);
      setRate(clamped);
      closeMenu();
    };
    customSetBtn.addEventListener("click", applyCustom);
    ["keydown", "keyup", "keypress"].forEach((t) =>
      customInput.addEventListener(t, (e) => {
        e.stopPropagation();
        if (t === "keydown" && e.key === "Enter") applyCustom();
      })
    );
    customControls.append(customInput, customSetBtn);
    custom.append(customLbl, customControls);
    menu.appendChild(custom);
    rows.push({
      el: custom,
      test: (r) => !same(r, 1) && !PRESETS.some((p) => same(r, p)),
    });

    // Divider
    const div2 = document.createElement("div");
    div2.className = "yths-divider";
    menu.appendChild(div2);

    // Hold G Speed row
    const holdTitle = document.createElement("div");
    holdTitle.className = "yths-section-title";
    holdTitle.textContent = "Hold 'G' Key";
    menu.appendChild(holdTitle);

    const holdRow = document.createElement("div");
    holdRow.className = "yths-row yths-input-row";
    const holdLbl = document.createElement("span");
    holdLbl.textContent = "Speed";
    const holdControls = document.createElement("span");
    const holdInput = document.createElement("input");
    holdInput.type = "number";
    holdInput.min = String(MIN_RATE);
    holdInput.max = String(MAX_RATE);
    holdInput.step = "0.5";
    holdInput.value = String(getHoldRate());
    const holdSetBtn = document.createElement("button");
    holdSetBtn.className = "yths-set";
    holdSetBtn.textContent = "Save";

    const applyHoldRate = () => {
      const v = parseFloat(holdInput.value);
      if (!isFinite(v) || v <= 0) return;
      const clamped = Math.min(MAX_RATE, Math.max(MIN_RATE, v));
      holdInput.value = String(clamped);
      saveStorageRate(STORE_KEY_HOLD, clamped);
      holdSetBtn.textContent = "Saved!";
      setTimeout(() => {
        holdSetBtn.textContent = "Save";
      }, 900);
    };
    holdSetBtn.addEventListener("click", applyHoldRate);
    ["keydown", "keyup", "keypress"].forEach((t) =>
      holdInput.addEventListener(t, (e) => {
        e.stopPropagation();
        if (t === "keydown" && e.key === "Enter") applyHoldRate();
      })
    );
    holdControls.append(holdInput, holdSetBtn);
    holdRow.append(holdLbl, holdControls);
    menu.appendChild(holdRow);
  };

  const toggleMenu = () => {
    if (!menu) buildMenu();
    if (menuOpen()) return closeMenu();
    const player = document.getElementById("movie_player") || (btn && btn.closest(".html5-video-player"));
    if (!player) return;
    player.appendChild(menu);
    menu.style.display = "block";
    refreshMenu();
  };

  const makeButton = () => {
    addStyles();
    const b = document.createElement("button");
    b.id = "yths-btn";
    b.className = "ytp-button";
    b.title = "Speed boost";
    b.setAttribute("aria-label", "Speed boost");
    b.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>';
    btnLabel = document.createElement("span");
    btnLabel.className = "yths-pill";
    b.appendChild(btnLabel);
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });
    return b;
  };

  const inject = () => {
    if (document.getElementById("yths-btn")) return;
    const settings = document.querySelector("#movie_player .ytp-settings-button");
    const host = settings ? settings.parentElement : document.querySelector("#movie_player .ytp-right-controls");
    if (!host) return;
    if (!btn) btn = makeButton();
    host.insertBefore(btn, settings && settings.parentElement === host ? settings : host.firstChild);
    updateUI();
  };

  let scheduled = false;
  const scheduleInject = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      inject();
    });
  };

  new MutationObserver(scheduleInject).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Reset to 1x on navigation to a new video
  document.addEventListener("yt-navigate-finish", () => {
    resetToDefaultRate();
    scheduleInject();
  });
  scheduleInject();

  document.addEventListener(
    "ratechange",
    (e) => e.target instanceof HTMLVideoElement && updateUI(),
    true
  );

  // Ensure every new video stream starts at 1x
  const handleNewVideoLoad = (e) => {
    const v = e.target;
    if (v instanceof HTMLVideoElement && v.classList.contains("html5-main-video") && !holdActive) {
      if (!same(v.playbackRate, 1)) {
        v.playbackRate = 1;
      }
      updateUI();
    }
  };

  document.addEventListener("loadstart", handleNewVideoLoad, true);
  document.addEventListener("loadedmetadata", handleNewVideoLoad, true);

  document.addEventListener(
    "mousedown",
    (e) => {
      if (menuOpen() && !menu.contains(e.target) && !(btn && btn.contains(e.target))) closeMenu();
    },
    true
  );

  /* ================= Key handling ================= */
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && menuOpen()) return closeMenu();
      if (isTyping(e.target)) return;

      // Speed up by 2x: Shift + } (max 16x)
      if (
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.shiftKey &&
        (e.key === "}" || e.key === "]" || e.code === "BracketRight")
      ) {
        if (holdActive) return;
        e.preventDefault();
        e.stopPropagation();
        const next = Math.min(SHORTCUT_MAX_RATE, Number((currentRate() * 2).toFixed(4)));
        setRate(next);
        showToast(next);
        return;
      }

      // Slow down by 2x: Shift + { (min 0.25x)
      if (
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.shiftKey &&
        (e.key === "{" || e.key === "[" || e.code === "BracketLeft")
      ) {
        if (holdActive) return;
        e.preventDefault();
        e.stopPropagation();
        const next = Math.max(SHORTCUT_MIN_RATE, Number((currentRate() / 2).toFixed(4)));
        setRate(next);
        showToast(next);
        return;
      }

      // Hold G Key boost
      if (e.code !== HOLD_CODE) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.repeat) return;
      startHold();
    },
    true
  );

  document.addEventListener(
    "keyup",
    (e) => {
      if (e.code === HOLD_CODE) stopHold();
    },
    true
  );
  window.addEventListener("blur", stopHold);
  document.addEventListener("visibilitychange", () => document.hidden && stopHold());

  // Enforce initial default 1x on script run
  resetToDefaultRate();
})();