const landingView = document.querySelector("#home");
const creatorView = document.querySelector("#creator");
const themeEditorView = document.querySelector("#theme-editor");
const wallpaperEditorView = document.querySelector("#wallpaper-editor");
const startButton = document.querySelector("#start-modding");
const backButton = document.querySelector("#back-home");
const backCreatorButton = document.querySelector("#back-creator");
const backWallpaperButton = document.querySelector("#back-wallpaper");
const editorNotice = document.querySelector("#editor-notice");
const categoryButtons = document.querySelectorAll("[data-category]");

const transitionDuration = 260;
let noticeTimer;

const themeValues = {
  dark: {
    accent: { h: 347, s: 96, l: 55 },
    secondary: { h: 258, s: 24, l: 16 }
  },
  light: {
    accent: { h: 347, s: 96, l: 55 },
    secondary: { h: 258, s: 22, l: 91 }
  }
};

const savedThemeValues = {
  dark: null,
  light: null
};

let activeThemeMode = "dark";

function switchView(fromView, toView) {
  fromView.classList.remove("is-active");
  fromView.classList.add("is-leaving");

  window.setTimeout(() => {
    fromView.classList.remove("is-leaving");
    fromView.setAttribute("aria-hidden", "true");
    toView.removeAttribute("aria-hidden");
    toView.classList.add("is-active");
    window.scrollTo({ top: 0, behavior: "smooth" });

    const focusTarget = toView.querySelector("h1, h2");
    focusTarget?.setAttribute("tabindex", "-1");
    focusTarget?.focus({ preventScroll: true });
  }, transitionDuration);
}

function showEditorNotice(category) {
  window.clearTimeout(noticeTimer);
  editorNotice.innerHTML = `<strong>${category}</strong> is mapped and ready for its editor in the next build step.`;
  editorNotice.classList.add("is-visible");

  noticeTimer = window.setTimeout(() => {
    editorNotice.classList.remove("is-visible");
  }, 3200);
}

startButton.addEventListener("click", () => {
  switchView(landingView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backButton.addEventListener("click", () => {
  switchView(creatorView, landingView);
  window.history.replaceState(null, "", "#home");
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.category === "Theme editor") {
      applyPageTheme();
      switchView(creatorView, themeEditorView);
      window.history.replaceState(null, "", "#theme-editor");
      return;
    }

    if (button.dataset.category === "Wallpaper editor") {
      renderWallpaperEditor();
      switchView(creatorView, wallpaperEditorView);
      window.history.replaceState(null, "", "#wallpaper-editor");
      return;
    }

    showEditorNotice(button.dataset.category);
  });
});

backCreatorButton.addEventListener("click", () => {
  resetPageTheme();
  switchView(themeEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backWallpaperButton.addEventListener("click", () => {
  switchView(wallpaperEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

const modeTabs = document.querySelectorAll(".mode-tab");
const colorInputs = document.querySelectorAll(".hsl-picker input");
const themeControls = document.querySelector("#theme-controls");
const secondaryLockValue = document.querySelector("#secondary-lock-value");
const secondaryLockNote = document.querySelector("#secondary-lock-note");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const saveThemeButton = document.querySelector("#save-theme-colors");
const saveThemeButtonLabel = saveThemeButton.querySelector("span");
const themeSaveStatus = document.querySelector("#theme-save-status");
const savedThemeSummaries = {
  dark: document.querySelector("#saved-dark-summary"),
  light: document.querySelector("#saved-light-summary")
};

function hslString(color) {
  return `hsl(${color.h} ${color.s}% ${color.l}%)`;
}

function copyThemeValues(values) {
  return {
    accent: { ...values.accent },
    secondary: { ...values.secondary }
  };
}

function formatSavedTheme(mode, values) {
  const label = mode[0].toUpperCase() + mode.slice(1);
  const accent = values.accent;
  const secondary = values.secondary;
  return `${label} · Accent H${accent.h} S${accent.s} L${accent.l} · Base H${secondary.h} S${secondary.s} L${secondary.l}`;
}

function updateSavedThemeSummary(mode) {
  const summary = savedThemeSummaries[mode];
  const values = savedThemeValues[mode];
  summary.hidden = !values;
  summary.textContent = values ? formatSavedTheme(mode, values) : "";
}

function applyPageTheme() {
  const values = themeValues[activeThemeMode];
  const pageLightness = activeThemeMode === "dark" ? 4 : 98;
  document.body.classList.add("theme-preview-active");
  document.body.classList.toggle("theme-mode-dark", activeThemeMode === "dark");
  document.body.classList.toggle("theme-mode-light", activeThemeMode === "light");
  document.body.style.setProperty("--opera-gx-accent-color", hslString(values.accent));
  document.body.style.setProperty("--opera-gx-background-color", hslString(values.secondary));
  document.body.style.setProperty("--gx-secondary-h", values.secondary.h);
  document.body.style.setProperty("--gx-secondary-s", `${values.secondary.s}%`);
  themeColorMeta.setAttribute("content", `hsl(${values.secondary.h} ${values.secondary.s}% ${pageLightness}%)`);
}

function resetPageTheme() {
  document.body.classList.remove("theme-preview-active", "theme-mode-dark", "theme-mode-light");
  document.body.style.removeProperty("--opera-gx-accent-color");
  document.body.style.removeProperty("--opera-gx-background-color");
  document.body.style.removeProperty("--gx-secondary-h");
  document.body.style.removeProperty("--gx-secondary-s");
  themeColorMeta.setAttribute("content", "#251f33");
}

function updateRangeAppearance(input, color) {
  const channel = input.dataset.channel;
  const value = color[channel];

  if (channel === "h") {
    input.style.setProperty("--range-track", "linear-gradient(90deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))");
  } else if (channel === "s") {
    input.style.setProperty("--range-track", `linear-gradient(90deg, hsl(${color.h} 0% ${color.l}%), hsl(${color.h} 100% ${color.l}%))`);
  } else {
    input.style.setProperty("--range-track", `linear-gradient(90deg, hsl(${color.h} ${color.s}% 0%), hsl(${color.h} ${color.s}% 50%), hsl(${color.h} ${color.s}% 100%))`);
  }

  input.style.setProperty("--range-progress", `${value / Number(input.max) * 100}%`);
}

function renderThemeEditor() {
  const values = themeValues[activeThemeMode];
  const lockedLightness = activeThemeMode === "dark" ? 16 : 91;
  values.secondary.l = lockedLightness;

  ["accent", "secondary"].forEach((colorName) => {
    const color = values[colorName];
    ["h", "s", "l"].forEach((channel) => {
      const input = document.querySelector(`#${colorName}-${channel}`);
      input.value = color[channel];
      document.querySelector(`#${colorName}-${channel}-value`).textContent = `${color[channel]}${channel === "h" ? "°" : "%"}`;
      updateRangeAppearance(input, color);
    });
    document.querySelector(`#${colorName}-output`).textContent = hslString(color);
  });

  secondaryLockValue.textContent = `${lockedLightness}%`;
  secondaryLockNote.lastChild.textContent = ` in ${activeThemeMode} mode.`;
  saveThemeButtonLabel.textContent = `Save ${activeThemeMode} colors`;
  themeSaveStatus.textContent = "";

  if (document.body.classList.contains("theme-preview-active")) {
    applyPageTheme();
  }
}

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeThemeMode = tab.dataset.mode;
    modeTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", selected.toString());
    });
    themeControls.setAttribute("aria-labelledby", tab.id);
    renderThemeEditor();
  });
});

colorInputs.forEach((input) => {
  input.addEventListener("input", () => {
    const colorName = input.closest(".hsl-picker").dataset.color;
    themeValues[activeThemeMode][colorName][input.dataset.channel] = Number(input.value);
    renderThemeEditor();
  });
});

saveThemeButton.addEventListener("click", () => {
  savedThemeValues[activeThemeMode] = copyThemeValues(themeValues[activeThemeMode]);
  updateSavedThemeSummary(activeThemeMode);
  const modeLabel = activeThemeMode[0].toUpperCase() + activeThemeMode.slice(1);
  themeSaveStatus.textContent = `${modeLabel} colors saved for this visit.`;
});

const wallpaperModeTabs = document.querySelectorAll("[data-wallpaper-mode]");
const wallpaperFileInput = document.querySelector("#wallpaper-file");
const wallpaperDropzone = document.querySelector("#wallpaper-dropzone");
const wallpaperDropStatus = document.querySelector("#wallpaper-drop-status");
const wallpaperPresetButtons = document.querySelectorAll("[data-wallpaper-preset]");
const wallpaperSelection = document.querySelector("#wallpaper-selection");
const wallpaperSelectionMode = document.querySelector("#wallpaper-selection-mode");
const wallpaperFileName = document.querySelector("#wallpaper-file-name");
const wallpaperAnimationNotice = document.querySelector("#wallpaper-animation-notice");
const clearWallpaperButton = document.querySelector("#clear-wallpaper");
const saveWallpaperButton = document.querySelector("#save-wallpaper");
const saveWallpaperButtonLabel = saveWallpaperButton.querySelector("span");
const wallpaperSaveStatus = document.querySelector("#wallpaper-save-status");
const wallpaperPreview = document.querySelector("#wallpaper-preview");
const wallpaperPreviewMode = document.querySelector("#wallpaper-preview-mode");
const wallpaperPreviewImage = document.querySelector("#speed-wallpaper-image");
const wallpaperPreviewVideo = document.querySelector("#speed-wallpaper-video");
const wallpaperThemeLabel = document.querySelector("#wallpaper-theme-label");
const wallpaperThemeDetail = document.querySelector("#wallpaper-theme-detail");

const wallpaperSelections = {
  dark: null,
  light: null
};

const includedWallpaperPresets = {
  dark: {
    image: {
      name: "dark_logo.png",
      url: "ModTemplate2.0/wallpaper/dark_logo.png"
    },
    video: {
      name: "dark_logo_animated.webm",
      url: "ModTemplate2.0/wallpaper/dark_logo_animated.webm"
    }
  },
  light: {
    image: {
      name: "light_logo.png",
      url: "ModTemplate2.0/wallpaper/light_logo.png"
    },
    video: {
      name: "light_logo_animated.webm",
      url: "ModTemplate2.0/wallpaper/light_logo_animated.webm"
    }
  }
};

const savedWallpaperSelections = {
  dark: null,
  light: null
};

const savedWallpaperSummaries = {
  dark: document.querySelector("#saved-dark-wallpaper-summary"),
  light: document.querySelector("#saved-light-wallpaper-summary")
};

let activeWallpaperMode = "dark";

function getWallpaperTheme(mode) {
  return savedThemeValues[mode] || themeValues[mode];
}

function updateSavedWallpaperSummary(mode) {
  const summary = savedWallpaperSummaries[mode];
  const selection = savedWallpaperSelections[mode];
  summary.hidden = !selection;
  summary.textContent = selection
    ? `${mode[0].toUpperCase() + mode.slice(1)} · ${selection.kind === "video" ? "Animated" : "Static"} · ${selection.name}`
    : "";
}

function renderWallpaperMedia() {
  const selection = wallpaperSelections[activeWallpaperMode];
  wallpaperPreviewImage.style.backgroundImage = "none";
  wallpaperPreviewVideo.pause();
  wallpaperPreviewVideo.removeAttribute("src");
  wallpaperPreviewVideo.load();
  wallpaperPreviewVideo.hidden = true;

  if (!selection) {
    wallpaperSelection.hidden = true;
    return;
  }

  wallpaperSelection.hidden = false;
  wallpaperSelectionMode.textContent = activeWallpaperMode;
  wallpaperFileName.textContent = selection.name;
  wallpaperAnimationNotice.hidden = selection.kind !== "video";

  if (selection.kind === "video") {
    wallpaperPreviewVideo.src = selection.url;
    wallpaperPreviewVideo.hidden = false;
    wallpaperPreviewVideo.play().catch(() => {});
  } else {
    wallpaperPreviewImage.style.backgroundImage = `url("${selection.url}")`;
  }
}

function renderWallpaperEditor() {
  const modeLabel = activeWallpaperMode[0].toUpperCase() + activeWallpaperMode.slice(1);
  const values = getWallpaperTheme(activeWallpaperMode);
  const hasSavedTheme = Boolean(savedThemeValues[activeWallpaperMode]);

  wallpaperPreview.dataset.mode = activeWallpaperMode;
  wallpaperPreview.style.setProperty("--speed-accent", hslString(values.accent));
  wallpaperPreview.style.setProperty("--speed-secondary-h", values.secondary.h);
  wallpaperPreview.style.setProperty("--speed-secondary-s", `${values.secondary.s}%`);
  wallpaperPreviewMode.textContent = modeLabel;
  wallpaperThemeLabel.textContent = `${modeLabel} theme preview`;
  wallpaperThemeDetail.textContent = hasSavedTheme
    ? `Using your saved ${activeWallpaperMode} HSL palette.`
    : `Using the current GX ${activeWallpaperMode} palette.`;
  saveWallpaperButton.disabled = !wallpaperSelections[activeWallpaperMode];
  saveWallpaperButtonLabel.textContent = `Save ${activeWallpaperMode} wallpaper`;

  wallpaperPresetButtons.forEach((button) => {
    const selection = wallpaperSelections[activeWallpaperMode];
    const selected = selection?.source === "included" && selection.kind === button.dataset.wallpaperPreset;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected.toString());
  });

  wallpaperModeTabs.forEach((tab) => {
    const selected = tab.dataset.wallpaperMode === activeWallpaperMode;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", selected.toString());
  });

  renderWallpaperMedia();
}

wallpaperModeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeWallpaperMode = tab.dataset.wallpaperMode;
    wallpaperSaveStatus.textContent = "";
    renderWallpaperEditor();
  });
});

function selectWallpaperFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const supportedImages = ["png", "jpg", "jpeg", "webp"];
  const supportedVideos = ["webm", "mp4"];
  const isImage = file.type.startsWith("image/") || supportedImages.includes(extension);
  const isVideo = file.type.startsWith("video/") || supportedVideos.includes(extension);

  if (!isImage && !isVideo) {
    wallpaperDropStatus.textContent = "That file type is not supported.";
    return;
  }

  const previousSelection = wallpaperSelections[activeWallpaperMode];
  if (previousSelection?.isObjectUrl) {
    URL.revokeObjectURL(previousSelection.url);
  }

  wallpaperSelections[activeWallpaperMode] = {
    file,
    isObjectUrl: true,
    kind: isVideo ? "video" : "image",
    name: file.name,
    source: "local",
    url: URL.createObjectURL(file)
  };
  wallpaperDropStatus.textContent = isVideo
    ? "Animated wallpaper ready for preview."
    : "Static wallpaper ready for preview.";
  wallpaperSaveStatus.textContent = "";
  renderWallpaperEditor();
}

function selectIncludedWallpaper(kind) {
  const previousSelection = wallpaperSelections[activeWallpaperMode];
  if (previousSelection?.isObjectUrl) {
    URL.revokeObjectURL(previousSelection.url);
  }

  const preset = includedWallpaperPresets[activeWallpaperMode][kind];
  wallpaperSelections[activeWallpaperMode] = {
    file: null,
    isObjectUrl: false,
    kind,
    name: preset.name,
    source: "included",
    url: preset.url
  };
  wallpaperDropStatus.textContent = kind === "video"
    ? "Included animated wallpaper ready for preview."
    : "Included static wallpaper ready for preview.";
  wallpaperSaveStatus.textContent = "";
  renderWallpaperEditor();
}

wallpaperPresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectIncludedWallpaper(button.dataset.wallpaperPreset);
  });
});

wallpaperFileInput.addEventListener("change", () => {
  const file = wallpaperFileInput.files?.[0];
  if (file) {
    selectWallpaperFile(file);
  }
  wallpaperFileInput.value = "";
});

["dragenter", "dragover"].forEach((eventName) => {
  wallpaperDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    wallpaperDropzone.classList.add("is-dragging");
  });
});

["dragleave", "dragend"].forEach((eventName) => {
  wallpaperDropzone.addEventListener(eventName, (event) => {
    if (eventName === "dragleave" && wallpaperDropzone.contains(event.relatedTarget)) {
      return;
    }
    wallpaperDropzone.classList.remove("is-dragging");
  });
});

wallpaperDropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  wallpaperDropzone.classList.remove("is-dragging");
  const file = event.dataTransfer.files?.[0];
  if (file) {
    selectWallpaperFile(file);
  }
});

clearWallpaperButton.addEventListener("click", () => {
  const selection = wallpaperSelections[activeWallpaperMode];
  if (selection) {
    if (selection.isObjectUrl) {
      URL.revokeObjectURL(selection.url);
    }
    wallpaperSelections[activeWallpaperMode] = null;
  }
  wallpaperDropStatus.textContent = "";
  wallpaperSaveStatus.textContent = "";
  renderWallpaperEditor();
});

saveWallpaperButton.addEventListener("click", () => {
  const selection = wallpaperSelections[activeWallpaperMode];
  if (!selection) {
    return;
  }

  savedWallpaperSelections[activeWallpaperMode] = {
    file: selection.file,
    kind: selection.kind,
    name: selection.name,
    source: selection.source
  };
  updateSavedWallpaperSummary(activeWallpaperMode);
  const modeLabel = activeWallpaperMode[0].toUpperCase() + activeWallpaperMode.slice(1);
  wallpaperSaveStatus.textContent = `${modeLabel} wallpaper saved for this visit.`;
});

renderThemeEditor();
renderWallpaperEditor();

if (["#creator", "#theme-editor", "#wallpaper-editor"].includes(window.location.hash)) {
  landingView.classList.remove("is-active");
  landingView.setAttribute("aria-hidden", "true");
  const initialViews = {
    "#creator": creatorView,
    "#theme-editor": themeEditorView,
    "#wallpaper-editor": wallpaperEditorView
  };
  const initialView = initialViews[window.location.hash];
  initialView.removeAttribute("aria-hidden");
  initialView.classList.add("is-active");
  if (initialView === themeEditorView) {
    applyPageTheme();
  }
  if (initialView === wallpaperEditorView) {
    renderWallpaperEditor();
  }
}
