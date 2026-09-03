const landingView = document.querySelector("#home");
const creatorView = document.querySelector("#creator");
const themeEditorView = document.querySelector("#theme-editor");
const appIconEditorView = document.querySelector("#app-icon-editor");
const modIconEditorView = document.querySelector("#mod-icon-editor");
const wallpaperEditorView = document.querySelector("#wallpaper-editor");
const musicEditorView = document.querySelector("#music-editor");
const browserSoundsEditorView = document.querySelector("#browser-sounds-editor");
const keyboardSoundsEditorView = document.querySelector("#keyboard-sounds-editor");
const fontEditorView = document.querySelector("#font-editor");
const splashEditorView = document.querySelector("#splash-editor");
const cursorEditorView = document.querySelector("#cursor-editor");
const buildReviewView = document.querySelector("#build-review");
const brandHomeLink = document.querySelector(".brand");
const startButton = document.querySelector("#start-modding");
const backButton = document.querySelector("#back-home");
const backCreatorButton = document.querySelector("#back-creator");
const backAppIconButton = document.querySelector("#back-app-icon");
const backModIconButton = document.querySelector("#back-mod-icon");
const backWallpaperButton = document.querySelector("#back-wallpaper");
const backMusicButton = document.querySelector("#back-music");
const backBrowserSoundsButton = document.querySelector("#back-browser-sounds");
const backKeyboardSoundsButton = document.querySelector("#back-keyboard-sounds");
const backFontsButton = document.querySelector("#back-fonts");
const backSplashButton = document.querySelector("#back-splash");
const backCursorsButton = document.querySelector("#back-cursors");
const backBuildReviewButton = document.querySelector("#back-build-review");
const createModButton = document.querySelector("#create-mod");
const buildSummaryGroups = document.querySelector("#build-summary-groups");
const buildModButton = document.querySelector("#build-mod");
const buildDonationDialog = document.querySelector("#build-donation-dialog");
const downloadModButton = document.querySelector("#download-mod");
const downloadModStatus = document.querySelector("#download-mod-status");
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

const speedDialEffectDefaults = {
  dark: {
    backgroundBlur: 0,
    backgroundOpacity: 50,
    focusMode: false,
    islandsOpacity: 0,
    position: "auto",
    textColor: "#ffffff",
    textShadow: "#757575",
    vignetteStrength: 35
  },
  light: {
    backgroundBlur: 0,
    backgroundOpacity: 50,
    focusMode: false,
    islandsOpacity: 0,
    position: "auto",
    textColor: "#2c2735",
    textShadow: "#ffffff",
    vignetteStrength: 0
  }
};

const speedDialSettingKeys = [
  "position",
  "textColor",
  "textShadow",
  "backgroundBlur",
  "backgroundOpacity",
  "islandsOpacity",
  "vignetteStrength",
  "focusMode"
];

function createSpeedDialEffectValues(mode) {
  return {
    ...speedDialEffectDefaults[mode],
    enabled: Object.fromEntries(speedDialSettingKeys.map((key) => [key, false]))
  };
}

const speedDialEffectValues = {
  dark: createSpeedDialEffectValues("dark"),
  light: createSpeedDialEffectValues("light")
};

const savedSpeedDialEffectValues = {
  dark: null,
  light: null
};

const modBuildState = {
  browserSounds: null,
  keyboardSounds: null,
  fonts: null,
  splashScreen: null,
  cursors: null,
  music: {
    tracks: []
  }
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
  editorNotice.innerHTML = `<strong>${category}</strong> is mapped and ready for its editor in the next build step`;
  editorNotice.classList.add("is-visible");

  noticeTimer = window.setTimeout(() => {
    editorNotice.classList.remove("is-visible");
  }, 3200);
}

startButton.addEventListener("click", () => {
  switchView(landingView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

brandHomeLink.addEventListener("click", (event) => {
  event.preventDefault();
  const activeView = document.querySelector(".view.is-active");
  window.history.replaceState(null, "", "#home");

  if (!activeView || activeView === landingView) {
    return;
  }

  resetPageTheme();
  switchView(activeView, landingView);
});

createModButton.addEventListener("click", () => {
  if (!hasSavedModOptions()) {
    return;
  }
  ensureDefaultModIcon().catch(() => {});
  renderModIconEditor();
  switchView(creatorView, modIconEditorView);
  window.history.replaceState(null, "", "#mod-icon-editor");
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

    if (button.dataset.category === "App icon") {
      renderAppIconEditor();
      switchView(creatorView, appIconEditorView);
      window.history.replaceState(null, "", "#app-icon-editor");
      return;
    }

    if (button.dataset.category === "Music editor") {
      switchView(creatorView, musicEditorView);
      window.history.replaceState(null, "", "#music-editor");
      return;
    }

    if (button.dataset.category === "Cursors") {
      switchView(creatorView, cursorEditorView);
      window.history.replaceState(null, "", "#cursor-editor");
      return;
    }

    if (button.dataset.category === "Browser sounds") {
      switchView(creatorView, browserSoundsEditorView);
      window.history.replaceState(null, "", "#browser-sounds-editor");
      return;
    }

    if (button.dataset.category === "Keyboard sounds") {
      switchView(creatorView, keyboardSoundsEditorView);
      window.history.replaceState(null, "", "#keyboard-sounds-editor");
      return;
    }

    if (button.dataset.category === "Fonts") {
      switchView(creatorView, fontEditorView);
      window.history.replaceState(null, "", "#font-editor");
      return;
    }

    if (button.dataset.category === "Splash screen") {
      renderSplashEditor();
      switchView(creatorView, splashEditorView);
      window.history.replaceState(null, "", "#splash-editor");
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

backAppIconButton.addEventListener("click", () => {
  switchView(appIconEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backModIconButton.addEventListener("click", () => {
  switchView(modIconEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backMusicButton.addEventListener("click", () => {
  switchView(musicEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backBrowserSoundsButton.addEventListener("click", () => {
  stopBrowserSoundPreview();
  switchView(browserSoundsEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backKeyboardSoundsButton.addEventListener("click", () => {
  stopKeyboardSoundPreview();
  switchView(keyboardSoundsEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backFontsButton.addEventListener("click", () => {
  switchView(fontEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backSplashButton.addEventListener("click", () => {
  splashPreviewVideo.pause();
  switchView(splashEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backCursorsButton.addEventListener("click", () => {
  switchView(cursorEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backBuildReviewButton.addEventListener("click", () => {
  switchView(buildReviewView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

buildModButton.addEventListener("click", () => {
  downloadModStatus.textContent = "";
  buildDonationDialog.showModal();
});

buildDonationDialog.addEventListener("click", (event) => {
  const bounds = buildDonationDialog.getBoundingClientRect();
  const clickedOutside = event.clientX < bounds.left
    || event.clientX > bounds.right
    || event.clientY < bounds.top
    || event.clientY > bounds.bottom;
  if (clickedOutside) {
    buildDonationDialog.close();
  }
});

downloadModButton.addEventListener("click", async () => {
  downloadModButton.disabled = true;
  downloadModStatus.textContent = "Building MyMod.zip…";

  try {
    const zipBlob = await buildModArchive();
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "MyMod.zip";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
    downloadModStatus.textContent = "MyMod.zip is ready";
  } catch (error) {
    downloadModStatus.textContent = error.message || "The mod could not be packaged";
  } finally {
    downloadModButton.disabled = false;
  }
});

const modTemplateDirectories = [
  "app_icon", "cursors", "fonts", "game", "icons", "keyboard", "mobile_logo", "music",
  "sd_effects", "shaders", "sound", "splash", "stickers", "wallpaper", "webmodding"
];

function safeBuildFileName(name, fallbackName) {
  const leafName = String(name || fallbackName).split(/[\\/]/).pop();
  return leafName
    .replace(/\s+/g, "_")
    .replace(/[<>:"|?*\u0000-\u001f]/g, "_") || fallbackName;
}

function reserveBuildPath(directory, requestedName, usedPaths) {
  const safeName = safeBuildFileName(requestedName, "file");
  const dotIndex = safeName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? safeName.slice(0, dotIndex) : safeName;
  const extension = dotIndex > 0 ? safeName.slice(dotIndex) : "";
  let candidate = `${directory}/${safeName}`;
  let suffix = 2;
  while (usedPaths.has(candidate.toLowerCase())) {
    candidate = `${directory}/${baseName}_${suffix}${extension}`;
    suffix += 1;
  }
  usedPaths.add(candidate.toLowerCase());
  return candidate;
}

async function fetchBuildBlob(url, label) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${label} could not be loaded`);
  return response.blob();
}

async function getSavedWallpaperBlob(selection) {
  return selection.file || fetchBuildBlob(selection.previewUrl, selection.name);
}

function validateBuildFileReferences(entries, build) {
  const entryPaths = new Set(entries.filter((entry) => !entry.path.endsWith("/")).map((entry) => entry.path));
  const invalidPath = entries.find((entry) => /\s/.test(entry.path));
  if (invalidPath) throw new Error(`The packaged file path contains whitespace: ${invalidPath.path}`);

  const references = ["icon_512.png"];
  if (build.appIcon) references.push("app_icon/classic_GX_logo.png");
  build.music.forEach((track) => references.push(track.path));
  build.browserSounds?.items.forEach((item) => references.push(item.path));
  build.keyboardSounds?.items.forEach((item) => references.push(item.path));
  Object.values(build.fonts || {}).forEach((fontRole) => fontRole.variants.forEach((variant) => references.push(variant.path)));
  if (build.splashScreen) references.push(build.splashScreen.path);
  if (build.cursors) {
    references.push(build.cursors.preview);
    build.cursors.items.forEach((item) => references.push(item.path));
  }
  Object.values(build.wallpaper).forEach((wallpaper) => {
    ["image", "image_mobile", "first_frame"].forEach((field) => {
      if (wallpaper[field]) references.push(wallpaper[field]);
    });
  });

  const invalidReference = references.find((reference) => /\s/.test(reference));
  if (invalidReference) throw new Error(`The manifest file reference contains whitespace: ${invalidReference}`);
  const missingReference = references.find((reference) => !entryPaths.has(reference));
  if (missingReference) throw new Error(`The manifest references a file that was not packaged: ${missingReference}`);
}

function addFileChangeLogEntry(changeLog, originalName, outputPath) {
  const cleanOriginalName = String(originalName || "Unknown file").replace(/[\r\n]+/g, " ");
  changeLog.push(`${cleanOriginalName} -> ${outputPath}`);
}

function createFileChangeLog(changeLog) {
  const lines = [
    "GX Mod Builder - File Change Log",
    "",
    "Original filename -> Packaged filename",
    ...changeLog
  ];
  return `${lines.join("\r\n")}\r\n`;
}

function canvasToJpegBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("A wallpaper first frame could not be created")), "image/jpeg", 0.92);
  });
}

async function createWallpaperFirstFrame(videoBlob) {
  const videoUrl = URL.createObjectURL(videoBlob);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("The animated wallpaper preview timed out")), 30000);
      video.addEventListener("loadeddata", () => {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
      video.addEventListener("error", () => {
        window.clearTimeout(timeout);
        reject(new Error("The animated wallpaper first frame could not be decoded"));
      }, { once: true });
      video.src = videoUrl;
      video.load();
    });
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvasToJpegBlob(canvas);
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(videoUrl);
  }
}

function applySavedWallpaperSettings(target, settings) {
  if (!settings) return;
  target.speeddial_position = settings.position;
  target.text_color = settings.textColor;
  target.text_shadow = settings.textShadow;
  target.ui_settings = {
    background_opacity: settings.backgroundOpacity,
    background_blur: settings.backgroundBlur,
    islands_opacity: settings.islandsOpacity,
    vignette_strength: settings.vignetteStrength,
    focus_mode: settings.focusMode
  };
}

async function buildModArchive() {
  const [manifestResponse, licenseResponse] = await Promise.all([
    fetch("ModTemplate2.0/manifest.json"),
    fetch("ModTemplate2.0/license.txt")
  ]);
  if (!manifestResponse.ok) throw new Error("The mod manifest template could not be loaded");

  const templateManifest = await manifestResponse.json();
  const entries = [];
  const fileChangeLog = [];
  const usedPaths = new Set();
  modTemplateDirectories.forEach((directory) => entries.push({ path: `${directory}/`, data: "" }));
  if (licenseResponse.ok) entries.push({ path: "license.txt", data: await licenseResponse.blob() });

  const build = { appIcon: Boolean(savedAppIconValue), browserSounds: null, keyboardSounds: null, fonts: {}, splashScreen: null, cursors: null, music: [], theme: {}, wallpaper: {} };
  const modIconBlob = savedModIconValue?.file
    || await fetchBuildBlob("ModTemplate2.0/icon_512.png", "The default mod icon");
  entries.push({ path: "icon_512.png", data: modIconBlob });
  if (savedModIconValue) addFileChangeLogEntry(fileChangeLog, savedModIconValue.originalName, "icon_512.png");
  if (savedAppIconValue) {
    entries.push({ path: "app_icon/classic_GX_logo.png", data: savedAppIconValue.file });
    addFileChangeLogEntry(fileChangeLog, savedAppIconValue.originalName, "app_icon/classic_GX_logo.png");
  }

  ["dark", "light"].forEach((mode) => {
    if (savedThemeValues[mode]) build.theme[mode] = copyThemeValues(savedThemeValues[mode]);
  });

  const wallpaperBlobs = {};
  for (const mode of ["dark", "light", "mobile-dark", "mobile-light"]) {
    const selection = savedWallpaperSelections[mode];
    if (!selection) continue;
    const target = build.wallpaper[selection.themeMode] || {};
    build.wallpaper[selection.themeMode] = target;
    const wallpaperBlob = await getSavedWallpaperBlob(selection);
    const outputPath = reserveBuildPath("wallpaper", selection.name, usedPaths);
    entries.push({ path: outputPath, data: wallpaperBlob });
    addFileChangeLogEntry(fileChangeLog, selection.name, outputPath);
    target[selection.manifestField] = outputPath;
    wallpaperBlobs[mode] = wallpaperBlob;
  }

  for (const themeMode of ["dark", "light"]) {
    const target = build.wallpaper[themeMode];
    if (!target) continue;
    applySavedWallpaperSettings(
      target,
      savedSpeedDialEffectValues[themeMode] || createSpeedDialEffectValues(themeMode)
    );
    const animatedMode = savedWallpaperSelections[themeMode]?.kind === "video" ? themeMode : null;
    if (animatedMode) {
      const firstFramePath = `wallpaper/first_frame_${themeMode}.jpg`;
      entries.push({ path: firstFramePath, data: await createWallpaperFirstFrame(wallpaperBlobs[animatedMode]) });
      target.first_frame = firstFramePath;
    }
  }

  modBuildState.music.tracks.forEach((track) => {
    if (!track.media?.file) return;
    const outputPath = reserveBuildPath("music", track.media.file.name, usedPaths);
    entries.push({ path: outputPath, data: track.media.file });
    addFileChangeLogEntry(fileChangeLog, track.media.sourceName || track.media.file.name, outputPath);
    build.music.push({ author: track.author || "", name: track.songName, path: outputPath });
  });

  if (modBuildState.browserSounds?.items.length) {
    const items = modBuildState.browserSounds.items.map((item) => {
      const extension = item.file.name.split(".").pop().toLowerCase();
      const outputPath = `sound/${browserSoundFileName(item.type, extension)}`;
      entries.push({ path: outputPath, data: item.file });
      addFileChangeLogEntry(fileChangeLog, item.file.name, outputPath);
      return { path: outputPath, type: item.type };
    });
    build.browserSounds = { items };
  }

  if (modBuildState.keyboardSounds?.items.length) {
    const items = modBuildState.keyboardSounds.items.map((item) => {
      const extension = item.file.name.split(".").pop().toLowerCase();
      const outputPath = `keyboard/${keyboardSoundFileName(item.slot, extension)}`;
      entries.push({ path: outputPath, data: item.file });
      addFileChangeLogEntry(fileChangeLog, item.file.name, outputPath);
      return { path: outputPath, slot: item.slot, type: item.type };
    });
    build.keyboardSounds = { items };
  }

  if (modBuildState.fonts) {
    for (const role of ["header", "body"]) {
      const savedRole = modBuildState.fonts[role];
      if (!savedRole?.items.length) continue;
      const variants = savedRole.items.map((item) => {
        const outputPath = reserveBuildPath("fonts", item.file.name, usedPaths);
        entries.push({ path: outputPath, data: item.file });
        addFileChangeLogEntry(fileChangeLog, item.file.name, outputPath);
        return { path: outputPath };
      });
      build.fonts[role] = { name: savedRole.name, variants };
    }
  }

  if (modBuildState.splashScreen) {
    const splash = modBuildState.splashScreen;
    const splashBlob = splash.file || await fetchBuildBlob(splash.url, splash.name);
    const outputPath = reserveBuildPath("splash", splash.name, usedPaths);
    entries.push({ path: outputPath, data: splashBlob });
    addFileChangeLogEntry(fileChangeLog, splash.name, outputPath);
    build.splashScreen = { path: outputPath };
  }

  if (modBuildState.cursors?.items.length) {
    const cursorItems = modBuildState.cursors.items.map((item) => {
      const extension = item.file.name.split(".").pop().toLowerCase();
      const outputPath = `cursors/MyCursor/${cursorFileName(item.type, extension)}`;
      entries.push({ path: outputPath, data: item.file });
      addFileChangeLogEntry(fileChangeLog, item.file.name, outputPath);
      return { path: outputPath, type: item.type };
    });
    const previewPath = "cursors/MyCursor/preview.png";
    entries.push({ path: previewPath, data: await fetchBuildBlob(modBuildState.cursors.previewUrl, "The cursor preview") });
    entries.push({ path: "cursors/MyCursor/", data: "" });
    build.cursors = { items: cursorItems, preview: previewPath };
  }

  entries.push({ path: "Change_Log.txt", data: createFileChangeLog(fileChangeLog) });
  validateBuildFileReferences(entries, build);
  const manifest = ModPackager.createManifest(templateManifest, build);
  const manifestJson = JSON.stringify(manifest, null, 3).replace(
    /(\"tracks\": )\[\n\s+(\"[^\n]+\")\n\s+\]/g,
    "$1[$2]"
  );
  entries.push({
    path: "manifest.json",
    data: `${manifestJson.replace(/\n/g, "\r\n")}\r\n`
  });
  return ModPackager.createZipBlob(entries);
}

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
const savedThemeBox = document.querySelector("#saved-theme-box");
const themeCategoryCard = document.querySelector('[data-category="Theme editor"]');

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
  const hasSavedTheme = Object.values(savedThemeValues).some(Boolean);
  savedThemeBox.hidden = !hasSavedTheme;
  themeCategoryCard.classList.toggle("has-saved-data", hasSavedTheme);
  updateCreateModAvailability();
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
  secondaryLockNote.lastChild.textContent = ` in ${activeThemeMode} mode`;
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
  themeSaveStatus.textContent = `${modeLabel} colors saved for this visit`;
});

const appIconFileInput = document.querySelector("#app-icon-file");
const appIconDropzone = document.querySelector("#app-icon-dropzone");
const appIconDropStatus = document.querySelector("#app-icon-drop-status");
const appIconSelection = document.querySelector("#app-icon-selection");
const appIconFileName = document.querySelector("#app-icon-file-name");
const appIconDimensions = document.querySelector("#app-icon-dimensions");
const clearAppIconButton = document.querySelector("#clear-app-icon");
const saveAppIconButton = document.querySelector("#save-app-icon");
const appIconSaveStatus = document.querySelector("#app-icon-save-status");
const appIconAdjustments = document.querySelector("#app-icon-adjustments");
const appIconSizing = document.querySelector("#app-icon-sizing");
const appIconPreviewCanvas = document.querySelector("#app-icon-preview-canvas");
const appIconPreviewPlaceholder = document.querySelector("#app-icon-preview-placeholder");
const appIconPreviewName = document.querySelector("#app-icon-preview-name");
const appIconPresetButtons = document.querySelectorAll("[data-app-icon-preset]");
const savedAppIconBox = document.querySelector("#saved-app-icon-box");
const savedAppIconSummary = document.querySelector("#saved-app-icon-summary");
const appIconCategoryCard = document.querySelector('[data-category="App icon"]');
const appIconAdjustmentControls = [
  {
    input: document.querySelector("#app-icon-zoom"),
    key: "zoom",
    output: document.querySelector("#app-icon-zoom-value"),
    suffix: "%"
  },
  {
    input: document.querySelector("#app-icon-position-x"),
    key: "positionX",
    output: document.querySelector("#app-icon-position-x-value"),
    suffix: ""
  },
  {
    input: document.querySelector("#app-icon-position-y"),
    key: "positionY",
    output: document.querySelector("#app-icon-position-y-value"),
    suffix: ""
  },
  {
    input: document.querySelector("#app-icon-corner-radius"),
    key: "cornerRadius",
    output: document.querySelector("#app-icon-corner-radius-value"),
    suffix: "%"
  }
];

let appIconSelectionValue = null;
let savedAppIconValue = null;

const includedAppIconPresets = {
  classic: {
    name: "classic_GX_logo.png",
    url: "ModTemplate2.0/app_icon/classic_GX_logo.png"
  },
  dark: {
    name: "dark_GX_logo.png",
    url: "ModTemplate2.0/app_icon/dark_GX_logo.png"
  },
  light: {
    name: "light_GX_logo.png",
    url: "ModTemplate2.0/app_icon/light_GX_logo.png"
  }
};

function createDefaultAppIconAdjustments() {
  return {
    cornerRadius: 0,
    positionX: 0,
    positionY: 0,
    sizing: "crop",
    zoom: 100
  };
}

function addRoundedRectanglePath(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function renderAdjustedAppIcon() {
  const selection = appIconSelectionValue;
  const context = appIconPreviewCanvas.getContext("2d");
  context.clearRect(0, 0, 512, 512);

  if (!selection) {
    return;
  }

  const adjustments = selection.adjustments;
  const baseScale = adjustments.sizing === "fit"
    ? Math.min(512 / selection.width, 512 / selection.height)
    : Math.max(512 / selection.width, 512 / selection.height);
  const scale = baseScale * (adjustments.zoom / 100);
  const drawWidth = selection.width * scale;
  const drawHeight = selection.height * scale;
  const drawX = (512 - drawWidth) / 2 + adjustments.positionX * 2.56;
  const drawY = (512 - drawHeight) / 2 + adjustments.positionY * 2.56;
  const radius = 512 * (adjustments.cornerRadius / 100);

  context.save();
  addRoundedRectanglePath(context, 0, 0, 512, 512, radius);
  context.clip();
  context.drawImage(selection.sourceImage, drawX, drawY, drawWidth, drawHeight);
  context.restore();
}

function renderAppIconEditor() {
  const selection = appIconSelectionValue;
  appIconSelection.hidden = !selection;
  appIconAdjustments.hidden = !selection;
  saveAppIconButton.disabled = !selection;
  appIconFileName.textContent = selection?.name || "";
  appIconDimensions.textContent = selection ? `Original ${selection.width}×${selection.height} · Output 512×512 PNG` : "";
  appIconPreviewCanvas.hidden = !selection;
  appIconPreviewPlaceholder.hidden = Boolean(selection);
  appIconPreviewName.textContent = selection?.name || "No icon selected";

  appIconPresetButtons.forEach((button) => {
    const selected = selection?.source === "included" && selection.preset === button.dataset.appIconPreset;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", selected.toString());
  });

  if (selection) {
    appIconSizing.value = selection.adjustments.sizing;
    appIconAdjustmentControls.forEach(({ input, key, output, suffix }) => {
      input.value = selection.adjustments[key];
      output.textContent = `${selection.adjustments[key]}${suffix}`;
    });
  }

  renderAdjustedAppIcon();
}

function updateSavedAppIconSummary() {
  savedAppIconBox.hidden = !savedAppIconValue;
  savedAppIconSummary.textContent = savedAppIconValue
    ? `${savedAppIconValue.name} · ${savedAppIconValue.width}×${savedAppIconValue.height}`
    : "";
  appIconCategoryCard.classList.toggle("has-saved-data", Boolean(savedAppIconValue));
  updateCreateModAvailability();
}

function selectAppIcon(file) {
  const validTypes = ["image/png", "image/jpeg"];
  if (!file || !validTypes.includes(file.type)) {
    appIconDropStatus.textContent = "Choose a PNG or JPG image";
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  const image = new Image();
  image.addEventListener("load", () => {
    if (appIconSelectionValue?.isObjectUrl && appIconSelectionValue.previewUrl !== savedAppIconValue?.previewUrl) {
      URL.revokeObjectURL(appIconSelectionValue.previewUrl);
    }
    appIconSelectionValue = {
      adjustments: createDefaultAppIconAdjustments(),
      file,
      height: image.naturalHeight,
      isObjectUrl: true,
      name: file.name,
      preset: null,
      previewUrl,
      source: "local",
      sourceImage: image,
      width: image.naturalWidth
    };
    appIconDropStatus.textContent = image.naturalWidth === 512 && image.naturalHeight === 512
      ? "Icon ready for preview"
      : `Icon loaded at ${image.naturalWidth}×${image.naturalHeight} · 512×512 is recommended`;
    appIconSaveStatus.textContent = "";
    renderAppIconEditor();
  }, { once: true });
  image.addEventListener("error", () => {
    URL.revokeObjectURL(previewUrl);
    appIconDropStatus.textContent = "This image could not be opened";
  }, { once: true });
  image.src = previewUrl;
}

function selectIncludedAppIcon(presetKey) {
  const preset = includedAppIconPresets[presetKey];
  if (!preset) {
    return;
  }

  const image = new Image();
  image.addEventListener("load", () => {
    if (appIconSelectionValue?.isObjectUrl && appIconSelectionValue.previewUrl !== savedAppIconValue?.previewUrl) {
      URL.revokeObjectURL(appIconSelectionValue.previewUrl);
    }
    appIconSelectionValue = {
      adjustments: createDefaultAppIconAdjustments(),
      file: null,
      height: image.naturalHeight,
      isObjectUrl: false,
      name: preset.name,
      preset: presetKey,
      previewUrl: preset.url,
      source: "included",
      sourceImage: image,
      width: image.naturalWidth
    };
    appIconDropStatus.textContent = "Sample app icon ready for preview";
    appIconSaveStatus.textContent = "";
    renderAppIconEditor();
  }, { once: true });
  image.addEventListener("error", () => {
    appIconDropStatus.textContent = "This sample icon could not be opened";
  }, { once: true });
  image.src = preset.url;
}

appIconPresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectIncludedAppIcon(button.dataset.appIconPreset);
  });
});

appIconSizing.addEventListener("change", () => {
  if (!appIconSelectionValue) {
    return;
  }
  appIconSelectionValue.adjustments.sizing = appIconSizing.value;
  appIconSaveStatus.textContent = "";
  renderAppIconEditor();
});

appIconAdjustmentControls.forEach(({ input, key }) => {
  input.addEventListener("input", () => {
    if (!appIconSelectionValue) {
      return;
    }
    appIconSelectionValue.adjustments[key] = Number(input.value);
    appIconSaveStatus.textContent = "";
    renderAppIconEditor();
  });
});

appIconFileInput.addEventListener("change", () => {
  selectAppIcon(appIconFileInput.files[0]);
  appIconFileInput.value = "";
});

["dragenter", "dragover"].forEach((eventName) => {
  appIconDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    appIconDropzone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  appIconDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    appIconDropzone.classList.remove("is-dragging");
  });
});

appIconDropzone.addEventListener("drop", (event) => {
  selectAppIcon(event.dataTransfer.files[0]);
});

clearAppIconButton.addEventListener("click", () => {
  if (appIconSelectionValue?.isObjectUrl && appIconSelectionValue.previewUrl !== savedAppIconValue?.previewUrl) {
    URL.revokeObjectURL(appIconSelectionValue.previewUrl);
  }
  appIconSelectionValue = null;
  appIconDropStatus.textContent = "";
  appIconSaveStatus.textContent = "";
  renderAppIconEditor();
});

function exportAdjustedAppIcon() {
  return new Promise((resolve, reject) => {
    appIconPreviewCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("The adjusted icon could not be exported"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

saveAppIconButton.addEventListener("click", async () => {
  if (!appIconSelectionValue) {
    return;
  }

  saveAppIconButton.disabled = true;
  appIconSaveStatus.textContent = "Preparing 512×512 PNG";

  try {
    const blob = await exportAdjustedAppIcon();
    const baseName = appIconSelectionValue.name.replace(/\.[^.]+$/, "");
    const outputName = `${baseName}_512.png`;
    const outputFile = new File([blob], outputName, { type: "image/png" });
    const outputUrl = URL.createObjectURL(outputFile);

    if (savedAppIconValue?.isObjectUrl) {
      URL.revokeObjectURL(savedAppIconValue.previewUrl);
    }
    savedAppIconValue = {
      adjustments: { ...appIconSelectionValue.adjustments },
      file: outputFile,
      height: 512,
      isObjectUrl: true,
      name: outputName,
      originalName: appIconSelectionValue.name,
      previewUrl: outputUrl,
      source: appIconSelectionValue.source,
      width: 512
    };
    updateSavedAppIconSummary();
    appIconSaveStatus.textContent = "512×512 PNG saved for this visit";
  } catch (error) {
    appIconSaveStatus.textContent = error.message;
  } finally {
    saveAppIconButton.disabled = !appIconSelectionValue;
  }
});

const modIconFileInput = document.querySelector("#mod-icon-file");
const modIconDropzone = document.querySelector("#mod-icon-dropzone");
const modIconDropStatus = document.querySelector("#mod-icon-drop-status");
const modIconSelection = document.querySelector("#mod-icon-selection");
const modIconFileName = document.querySelector("#mod-icon-file-name");
const modIconDimensions = document.querySelector("#mod-icon-dimensions");
const resetModIconButton = document.querySelector("#reset-mod-icon");
const saveModIconButton = document.querySelector("#save-mod-icon");
const modIconSaveStatus = document.querySelector("#mod-icon-save-status");
const modIconAdjustments = document.querySelector("#mod-icon-adjustments");
const modIconSizing = document.querySelector("#mod-icon-sizing");
const modIconPreviewCanvas = document.querySelector("#mod-icon-preview-canvas");
const modIconPreviewPlaceholder = document.querySelector("#mod-icon-preview-placeholder");
const modIconPreviewName = document.querySelector("#mod-icon-preview-name");
const modIconAdjustmentControls = [
  {
    input: document.querySelector("#mod-icon-zoom"),
    key: "zoom",
    output: document.querySelector("#mod-icon-zoom-value"),
    suffix: "%"
  },
  {
    input: document.querySelector("#mod-icon-position-x"),
    key: "positionX",
    output: document.querySelector("#mod-icon-position-x-value"),
    suffix: ""
  },
  {
    input: document.querySelector("#mod-icon-position-y"),
    key: "positionY",
    output: document.querySelector("#mod-icon-position-y-value"),
    suffix: ""
  },
  {
    input: document.querySelector("#mod-icon-corner-radius"),
    key: "cornerRadius",
    output: document.querySelector("#mod-icon-corner-radius-value"),
    suffix: "%"
  }
];

const defaultModIcon = {
  name: "icon_512.png",
  url: "ModTemplate2.0/icon_512.png"
};
let modIconSelectionValue = null;
let savedModIconValue = null;
let modIconDefaultLoadPromise = null;

function releaseUnsavedModIconSelection() {
  if (modIconSelectionValue?.isObjectUrl && modIconSelectionValue.previewUrl !== savedModIconValue?.previewUrl) {
    URL.revokeObjectURL(modIconSelectionValue.previewUrl);
  }
}

function renderAdjustedModIcon() {
  const selection = modIconSelectionValue;
  const context = modIconPreviewCanvas.getContext("2d");
  context.clearRect(0, 0, 512, 512);

  if (!selection) {
    return;
  }

  const adjustments = selection.adjustments;
  const baseScale = adjustments.sizing === "fit"
    ? Math.min(512 / selection.width, 512 / selection.height)
    : Math.max(512 / selection.width, 512 / selection.height);
  const scale = baseScale * (adjustments.zoom / 100);
  const drawWidth = selection.width * scale;
  const drawHeight = selection.height * scale;
  const drawX = (512 - drawWidth) / 2 + adjustments.positionX * 2.56;
  const drawY = (512 - drawHeight) / 2 + adjustments.positionY * 2.56;
  const radius = 512 * (adjustments.cornerRadius / 100);

  context.save();
  addRoundedRectanglePath(context, 0, 0, 512, 512, radius);
  context.clip();
  context.drawImage(selection.sourceImage, drawX, drawY, drawWidth, drawHeight);
  context.restore();
}

function renderModIconEditor() {
  const selection = modIconSelectionValue;
  modIconSelection.hidden = !selection;
  modIconAdjustments.hidden = !selection;
  saveModIconButton.disabled = !selection;
  modIconFileName.textContent = selection?.name || "";
  modIconDimensions.textContent = selection ? `Original ${selection.width}×${selection.height} · Output 512×512 PNG` : "";
  modIconPreviewCanvas.hidden = !selection;
  modIconPreviewPlaceholder.hidden = Boolean(selection);
  modIconPreviewName.textContent = selection?.name || "Loading icon_512.png";

  if (selection) {
    modIconSizing.value = selection.adjustments.sizing;
    modIconAdjustmentControls.forEach(({ input, key, output, suffix }) => {
      input.value = selection.adjustments[key];
      output.textContent = `${selection.adjustments[key]}${suffix}`;
    });
  }

  renderAdjustedModIcon();
}

function selectDefaultModIcon(force = false) {
  if (!force && modIconSelectionValue) {
    return Promise.resolve(modIconSelectionValue);
  }
  if (!force && modIconDefaultLoadPromise) {
    return modIconDefaultLoadPromise;
  }

  modIconDefaultLoadPromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      releaseUnsavedModIconSelection();
      modIconSelectionValue = {
        adjustments: createDefaultAppIconAdjustments(),
        file: null,
        height: image.naturalHeight,
        isObjectUrl: false,
        name: defaultModIcon.name,
        previewUrl: defaultModIcon.url,
        source: "default",
        sourceImage: image,
        width: image.naturalWidth
      };
      modIconDropStatus.textContent = "Default mod icon ready for preview";
      modIconSaveStatus.textContent = "";
      renderModIconEditor();
      resolve(modIconSelectionValue);
    }, { once: true });
    image.addEventListener("error", () => {
      modIconDropStatus.textContent = "The default icon_512.png could not be opened";
      reject(new Error("The default mod icon could not be opened"));
    }, { once: true });
    image.src = defaultModIcon.url;
  }).finally(() => {
    modIconDefaultLoadPromise = null;
  });

  return modIconDefaultLoadPromise;
}

function ensureDefaultModIcon() {
  return selectDefaultModIcon(false);
}

function selectModIcon(file) {
  const validTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!file || !validTypes.includes(file.type)) {
    modIconDropStatus.textContent = "Choose a PNG, JPG, or WEBP image";
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  const image = new Image();
  image.addEventListener("load", () => {
    releaseUnsavedModIconSelection();
    modIconSelectionValue = {
      adjustments: createDefaultAppIconAdjustments(),
      file,
      height: image.naturalHeight,
      isObjectUrl: true,
      name: file.name,
      previewUrl,
      source: "local",
      sourceImage: image,
      width: image.naturalWidth
    };
    modIconDropStatus.textContent = image.naturalWidth === 512 && image.naturalHeight === 512
      ? "Icon ready for preview"
      : `Icon loaded at ${image.naturalWidth}×${image.naturalHeight} · adjust the 512×512 crop below`;
    modIconSaveStatus.textContent = "";
    renderModIconEditor();
  }, { once: true });
  image.addEventListener("error", () => {
    URL.revokeObjectURL(previewUrl);
    modIconDropStatus.textContent = "This image could not be opened";
  }, { once: true });
  image.src = previewUrl;
}

modIconSizing.addEventListener("change", () => {
  if (!modIconSelectionValue) {
    return;
  }
  modIconSelectionValue.adjustments.sizing = modIconSizing.value;
  modIconSaveStatus.textContent = "";
  renderModIconEditor();
});

modIconAdjustmentControls.forEach(({ input, key }) => {
  input.addEventListener("input", () => {
    if (!modIconSelectionValue) {
      return;
    }
    modIconSelectionValue.adjustments[key] = Number(input.value);
    modIconSaveStatus.textContent = "";
    renderModIconEditor();
  });
});

modIconFileInput.addEventListener("change", () => {
  selectModIcon(modIconFileInput.files[0]);
  modIconFileInput.value = "";
});

["dragenter", "dragover"].forEach((eventName) => {
  modIconDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    modIconDropzone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  modIconDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    modIconDropzone.classList.remove("is-dragging");
  });
});

modIconDropzone.addEventListener("drop", (event) => {
  selectModIcon(event.dataTransfer.files[0]);
});

resetModIconButton.addEventListener("click", () => {
  selectDefaultModIcon(true).catch(() => {});
});

function exportAdjustedModIcon() {
  return new Promise((resolve, reject) => {
    modIconPreviewCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("The adjusted mod icon could not be exported"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

saveModIconButton.addEventListener("click", async () => {
  if (!modIconSelectionValue) {
    return;
  }

  saveModIconButton.disabled = true;
  modIconSaveStatus.textContent = "Preparing icon_512.png";

  try {
    const blob = await exportAdjustedModIcon();
    const outputFile = new File([blob], "icon_512.png", { type: "image/png" });
    const outputUrl = URL.createObjectURL(outputFile);

    if (savedModIconValue?.isObjectUrl) {
      URL.revokeObjectURL(savedModIconValue.previewUrl);
    }
    savedModIconValue = {
      adjustments: { ...modIconSelectionValue.adjustments },
      file: outputFile,
      height: 512,
      isObjectUrl: true,
      name: "icon_512.png",
      originalName: modIconSelectionValue.name,
      previewUrl: outputUrl,
      source: modIconSelectionValue.source,
      width: 512
    };
    modIconSaveStatus.textContent = "icon_512.png saved for this visit";
    renderBuildSummary();
    switchView(modIconEditorView, buildReviewView);
    window.history.replaceState(null, "", "#build-review");
  } catch (error) {
    modIconSaveStatus.textContent = error.message;
  } finally {
    saveModIconButton.disabled = !modIconSelectionValue;
  }
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
const wallpaperPreviewHeading = document.querySelector("#speed-dial-preview-heading");
const wallpaperPresetLabel = document.querySelector("#wallpaper-preset-label");
const desktopWallpaperControls = document.querySelectorAll(".desktop-wallpaper-only");
const wallpaperPreviewImage = document.querySelector("#speed-wallpaper-image");
const wallpaperPreviewVideo = document.querySelector("#speed-wallpaper-video");
const wallpaperSelections = {
  dark: null,
  light: null,
  "mobile-dark": null,
  "mobile-light": null
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
  },
  "mobile-dark": {
    image: {
      name: "dark_logo.png",
      url: "ModTemplate2.0/wallpaper/dark_logo.png"
    },
    video: {
      name: "dark_logo_animated_mobile.mp4",
      url: "ModTemplate2.0/wallpaper/dark_logo_animated_mobile.mp4"
    }
  },
  "mobile-light": {
    image: {
      name: "light_logo.png",
      url: "ModTemplate2.0/wallpaper/light_logo.png"
    },
    video: {
      name: "light_logo_animated_mobile.mp4",
      url: "ModTemplate2.0/wallpaper/light_logo_animated_mobile.mp4"
    }
  }
};

const savedWallpaperSelections = {
  dark: null,
  light: null,
  "mobile-dark": null,
  "mobile-light": null
};

const savedWallpaperSummaries = {
  dark: document.querySelector("#saved-dark-wallpaper-summary"),
  light: document.querySelector("#saved-light-wallpaper-summary"),
  "mobile-dark": document.querySelector("#saved-mobile-dark-wallpaper-summary"),
  "mobile-light": document.querySelector("#saved-mobile-light-wallpaper-summary")
};
const savedWallpaperBox = document.querySelector("#saved-wallpaper-box");
const wallpaperCategoryCard = document.querySelector('[data-category="Wallpaper editor"]');

let activeWallpaperMode = "dark";

function isMobileWallpaperMode(mode) {
  return mode.startsWith("mobile-");
}

function getWallpaperThemeMode(mode) {
  return mode.endsWith("light") ? "light" : "dark";
}

function getWallpaperModeLabel(mode) {
  return `${isMobileWallpaperMode(mode) ? "Mobile" : "Desktop"} ${getWallpaperThemeMode(mode)}`;
}

function getWallpaperTheme(mode) {
  const themeMode = getWallpaperThemeMode(mode);
  return savedThemeValues[themeMode] || themeValues[themeMode];
}

function updateSavedWallpaperSummary(mode) {
  const summary = savedWallpaperSummaries[mode];
  const selection = savedWallpaperSelections[mode];
  const speedDial = isMobileWallpaperMode(mode) ? null : savedSpeedDialEffectValues[mode];
  const enabledSpeedDialCount = speedDial
    ? Object.values(speedDial.enabled).filter(Boolean).length
    : 0;
  const speedDialLabel = enabledSpeedDialCount === 1
    ? "1 optional wallpaper setting"
    : `${enabledSpeedDialCount} optional wallpaper settings`;
  summary.hidden = !selection;
  summary.textContent = selection
    ? `${getWallpaperModeLabel(mode)} · ${selection.kind === "video" ? "Animated" : "Static"} · ${selection.name}${speedDial ? ` · ${speedDialLabel}` : ""}`
    : "";
  const hasSavedWallpaper = Object.values(savedWallpaperSelections).some(Boolean);
  savedWallpaperBox.hidden = !hasSavedWallpaper;
  wallpaperCategoryCard.classList.toggle("has-saved-data", hasSavedWallpaper);
  updateCreateModAvailability();
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
  wallpaperSelectionMode.textContent = getWallpaperModeLabel(activeWallpaperMode).toLowerCase();
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
  const modeLabel = getWallpaperModeLabel(activeWallpaperMode);
  const themeMode = getWallpaperThemeMode(activeWallpaperMode);
  const isMobile = isMobileWallpaperMode(activeWallpaperMode);
  const values = getWallpaperTheme(activeWallpaperMode);
  wallpaperPreview.dataset.mode = themeMode;
  wallpaperPreview.classList.toggle("is-mobile-preview", isMobile);
  wallpaperPreview.style.setProperty("--speed-accent", hslString(values.accent));
  wallpaperPreview.style.setProperty("--speed-secondary-h", values.secondary.h);
  wallpaperPreview.style.setProperty("--speed-secondary-s", `${values.secondary.s}%`);
  wallpaperPreviewMode.textContent = modeLabel;
  wallpaperPreviewHeading.textContent = isMobile ? "Mobile wallpaper" : "GX Speed Dial";
  wallpaperPresetLabel.textContent = isMobile ? "Sample mobile wallpapers" : "Sample desktop wallpapers";
  desktopWallpaperControls.forEach((control) => {
    control.hidden = isMobile;
  });
  saveWallpaperButton.disabled = !wallpaperSelections[activeWallpaperMode];
  saveWallpaperButtonLabel.textContent = `Save ${modeLabel.toLowerCase()} wallpaper`;

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
  if (!isMobile) {
    renderWallpaperSpeedDialSettings();
  }
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
    wallpaperDropStatus.textContent = "That file type is not supported";
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
    ? "Animated wallpaper ready for preview"
    : "Static wallpaper ready for preview";
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
    ? "Sample animated wallpaper ready for preview"
    : "Sample static wallpaper ready for preview";
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

  const previousSavedSelection = savedWallpaperSelections[activeWallpaperMode];
  if (previousSavedSelection?.isObjectUrl) {
    URL.revokeObjectURL(previousSavedSelection.previewUrl);
  }

  savedWallpaperSelections[activeWallpaperMode] = {
    device: isMobileWallpaperMode(activeWallpaperMode) ? "mobile" : "desktop",
    file: selection.file,
    isObjectUrl: selection.source === "local",
    kind: selection.kind,
    manifestField: isMobileWallpaperMode(activeWallpaperMode) ? "image_mobile" : "image",
    name: selection.name,
    previewUrl: selection.source === "local" ? URL.createObjectURL(selection.file) : selection.url,
    source: selection.source,
    themeMode: getWallpaperThemeMode(activeWallpaperMode)
  };
  if (!isMobileWallpaperMode(activeWallpaperMode)) {
    savedSpeedDialEffectValues[activeWallpaperMode] = copySpeedDialEffectValues(
      speedDialEffectValues[activeWallpaperMode]
    );
  }
  updateSavedWallpaperSummary(activeWallpaperMode);
  const modeLabel = getWallpaperModeLabel(activeWallpaperMode);
  wallpaperSaveStatus.textContent = `${modeLabel} wallpaper saved for this visit`;
});

const speedDialPosition = document.querySelector("#speed-dial-position");
const speedDialPositionControl = document.querySelector("#speed-dial-position-control");
const speedDialPositionValue = document.querySelector("#speed-dial-position-value");
const speedDialPositionOptions = document.querySelector("#speed-dial-position-options");
const speedDialPositionChoices = document.querySelectorAll("[data-speed-dial-position]");
const speedDialTextColor = document.querySelector("#speed-dial-text-color");
const speedDialTextShadow = document.querySelector("#speed-dial-text-shadow");
const speedDialTextColorValue = document.querySelector("#speed-dial-text-color-value");
const speedDialTextShadowValue = document.querySelector("#speed-dial-text-shadow-value");
const speedDialFocusMode = document.querySelector("#speed-dial-focus-mode");
const speedDialSettingToggles = document.querySelectorAll("[data-speed-dial-setting]");
const speedDialSettingRows = document.querySelectorAll("[data-speed-dial-setting-row]");
const speedDialRangeControls = [
  {
    input: document.querySelector("#speed-dial-background-blur"),
    key: "backgroundBlur",
    output: document.querySelector("#speed-dial-background-blur-value")
  },
  {
    input: document.querySelector("#speed-dial-background-opacity"),
    key: "backgroundOpacity",
    output: document.querySelector("#speed-dial-background-opacity-value")
  },
  {
    input: document.querySelector("#speed-dial-islands-opacity"),
    key: "islandsOpacity",
    output: document.querySelector("#speed-dial-islands-opacity-value")
  },
  {
    input: document.querySelector("#speed-dial-vignette-strength"),
    key: "vignetteStrength",
    output: document.querySelector("#speed-dial-vignette-strength-value")
  }
];

function copySpeedDialEffectValues(values) {
  return {
    ...values,
    enabled: { ...values.enabled }
  };
}

function renderWallpaperSpeedDialSettings() {
  const values = speedDialEffectValues[activeWallpaperMode];
  const defaults = speedDialEffectDefaults[activeWallpaperMode];
  const theme = getWallpaperTheme(activeWallpaperMode);

  speedDialSettingToggles.forEach((toggle) => {
    toggle.checked = values.enabled[toggle.dataset.speedDialSetting];
  });
  speedDialSettingRows.forEach((row) => {
    row.classList.toggle("is-enabled", values.enabled[row.dataset.speedDialSettingRow]);
  });

  speedDialPositionValue.textContent = values.position[0].toUpperCase() + values.position.slice(1);
  speedDialPosition.disabled = !values.enabled.position;
  speedDialPositionChoices.forEach((choice) => {
    choice.setAttribute("aria-selected", (choice.dataset.speedDialPosition === values.position).toString());
  });
  speedDialTextColor.value = values.textColor;
  speedDialTextShadow.value = values.textShadow;
  speedDialTextColor.disabled = !values.enabled.textColor;
  speedDialTextShadow.disabled = !values.enabled.textShadow;
  speedDialTextColorValue.textContent = values.textColor.toUpperCase();
  speedDialTextShadowValue.textContent = values.textShadow.toUpperCase();
  speedDialFocusMode.checked = values.focusMode;

  speedDialRangeControls.forEach(({ input, key, output }) => {
    input.value = values[key];
    input.disabled = !values.enabled[key];
    output.textContent = values[key];
  });

  const previewValue = (key) => values.enabled[key] ? values[key] : defaults[key];
  wallpaperPreview.dataset.position = previewValue("position");
  wallpaperPreview.classList.toggle("is-focus-mode", previewValue("focusMode"));
  wallpaperPreview.style.setProperty("--speed-accent", hslString(theme.accent));
  wallpaperPreview.style.setProperty("--speed-secondary-h", theme.secondary.h);
  wallpaperPreview.style.setProperty("--speed-secondary-s", `${theme.secondary.s}%`);
  wallpaperPreview.style.setProperty("--speed-label-color", previewValue("textColor"));
  wallpaperPreview.style.setProperty("--speed-label-shadow", previewValue("textShadow"));
  wallpaperPreview.style.setProperty("--speed-effects-blur", `${previewValue("backgroundBlur") * 0.12}px`);
  wallpaperPreview.style.setProperty("--speed-effects-background-opacity", previewValue("backgroundOpacity") / 100);
  wallpaperPreview.style.setProperty("--speed-effects-islands-opacity", 0.16 + previewValue("islandsOpacity") * 0.008);
  wallpaperPreview.style.setProperty("--speed-effects-vignette", previewValue("vignetteStrength") / 100);
}

speedDialSettingToggles.forEach((toggle) => {
  toggle.addEventListener("change", () => {
    speedDialEffectValues[activeWallpaperMode].enabled[toggle.dataset.speedDialSetting] = toggle.checked;
    wallpaperSaveStatus.textContent = "";
    closeSpeedDialPositionMenu();
    renderWallpaperSpeedDialSettings();
  });
});

function closeSpeedDialPositionMenu() {
  speedDialPosition.setAttribute("aria-expanded", "false");
  speedDialPositionOptions.hidden = true;
}

speedDialPosition.addEventListener("click", () => {
  const isOpen = speedDialPosition.getAttribute("aria-expanded") === "true";
  speedDialPosition.setAttribute("aria-expanded", (!isOpen).toString());
  speedDialPositionOptions.hidden = isOpen;
});

speedDialPositionChoices.forEach((choice) => {
  choice.addEventListener("click", () => {
    speedDialEffectValues[activeWallpaperMode].position = choice.dataset.speedDialPosition;
    wallpaperSaveStatus.textContent = "";
    closeSpeedDialPositionMenu();
    renderWallpaperSpeedDialSettings();
    speedDialPosition.focus();
  });
});

document.addEventListener("click", (event) => {
  if (!speedDialPositionControl.contains(event.target)) {
    closeSpeedDialPositionMenu();
  }
});

speedDialPositionControl.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSpeedDialPositionMenu();
    speedDialPosition.focus();
  }
});

speedDialTextColor.addEventListener("input", () => {
  speedDialEffectValues[activeWallpaperMode].textColor = speedDialTextColor.value;
  wallpaperSaveStatus.textContent = "";
  renderWallpaperSpeedDialSettings();
});

speedDialTextShadow.addEventListener("input", () => {
  speedDialEffectValues[activeWallpaperMode].textShadow = speedDialTextShadow.value;
  wallpaperSaveStatus.textContent = "";
  renderWallpaperSpeedDialSettings();
});

speedDialRangeControls.forEach(({ input, key }) => {
  input.addEventListener("input", () => {
    speedDialEffectValues[activeWallpaperMode][key] = Number(input.value);
    wallpaperSaveStatus.textContent = "";
    renderWallpaperSpeedDialSettings();
  });
});

speedDialFocusMode.addEventListener("change", () => {
  speedDialEffectValues[activeWallpaperMode].focusMode = speedDialFocusMode.checked;
  speedDialEffectValues[activeWallpaperMode].enabled.focusMode = speedDialFocusMode.checked;
  wallpaperSaveStatus.textContent = "";
  renderWallpaperSpeedDialSettings();
});

const BROWSER_SOUND_DEFINITIONS = [
  ["CLICK", "Standard click", "click.mp3"],
  ["FEATURE_SWITCH_OFF", "Feature switch off", "feature_switch_off.mp3"],
  ["FEATURE_SWITCH_ON", "Feature switch on", "feature_switch_on.mp3"],
  ["HOVER", "Hover", "hover.mp3"],
  ["HOVER_UP", "Hover release", "hover.mp3"],
  ["IMPORTANT_CLICK", "Important click", "important_click.mp3"],
  ["LEVEL_UPGRADE", "Level upgrade", "level_upgrade.mp3"],
  ["LIMITER_OFF", "Limiter off", "limiter_off.mp3"],
  ["LIMITER_ON", "Limiter on", "limiter_on.mp3"],
  ["SWITCH_TOGGLE", "Switch toggle", "switch.mp3"],
  ["TAB_CLOSE", "Tab close", "tab_close.mp3"],
  ["TAB_INSERT", "Tab open", "tab_insert.mp3"],
  ["TAB_SLASH", "Tab slash", "tab_slash.mp3"]
].map(([type, label, sampleFile]) => ({
  label,
  sampleFile,
  sampleUrl: `ModTemplate2.0/sound/${sampleFile}`,
  type
}));

const browserSoundGrid = document.querySelector("#browser-sound-grid");
const browserSoundChangeCount = document.querySelector("#browser-sound-change-count");
const browserSoundSaveButton = document.querySelector("#save-browser-sounds");
const browserSoundSaveStatus = document.querySelector("#browser-sound-save-status");
const savedBrowserSoundsBox = document.querySelector("#saved-browser-sounds-box");
const savedBrowserSoundsSummary = document.querySelector("#saved-browser-sounds-summary");
const browserSoundsCategoryCard = document.querySelector('[data-category="Browser sounds"]');
const browserSoundSelections = new Map();
let activeBrowserSoundAudio = null;
let activeBrowserSoundButton = null;

function browserSoundFileName(type, extension = "mp3") {
  return `${type.toLowerCase()}.${extension}`;
}

function stopBrowserSoundPreview() {
  if (activeBrowserSoundAudio) {
    activeBrowserSoundAudio.pause();
    activeBrowserSoundAudio.currentTime = 0;
    activeBrowserSoundAudio = null;
  }
  if (activeBrowserSoundButton) {
    activeBrowserSoundButton.textContent = "Play";
    activeBrowserSoundButton.classList.remove("is-playing");
    activeBrowserSoundButton = null;
  }
}

function updateBrowserSoundChangeCount() {
  const count = browserSoundSelections.size;
  browserSoundChangeCount.textContent = count
    ? `${count} custom browser ${count === 1 ? "sound" : "sounds"} selected`
    : "No custom browser sounds selected";
  browserSoundSaveButton.disabled = count === 0;
  browserSoundSaveStatus.textContent = "";
}

function setBrowserSoundTileSelection(tile, definition, file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["mp3", "wav", "ogg"].includes(extension)) {
    tile.querySelector(".browser-sound-status").textContent = "Choose an MP3, WAV, or OGG file";
    return;
  }
  const previous = browserSoundSelections.get(definition.type);
  if (previous) URL.revokeObjectURL(previous.previewUrl);
  const selection = { extension, file, previewUrl: URL.createObjectURL(file) };
  browserSoundSelections.set(definition.type, selection);
  tile.classList.add("has-custom-sound");
  tile.querySelector(".cursor-source-badge").textContent = "Custom";
  tile.querySelector(".browser-sound-status").textContent = file.name;
  tile.querySelector(".browser-sound-reset").hidden = false;
  updateBrowserSoundChangeCount();
}

function resetBrowserSoundTile(tile, definition) {
  stopBrowserSoundPreview();
  const selection = browserSoundSelections.get(definition.type);
  if (selection) URL.revokeObjectURL(selection.previewUrl);
  browserSoundSelections.delete(definition.type);
  tile.classList.remove("has-custom-sound", "is-dragging");
  tile.querySelector(".cursor-source-badge").textContent = "Sample";
  tile.querySelector(".browser-sound-status").textContent = definition.sampleFile;
  tile.querySelector(".browser-sound-reset").hidden = true;
  tile.querySelector(".browser-sound-file-input").value = "";
  updateBrowserSoundChangeCount();
}

function playBrowserSound(tile, definition) {
  const playButton = tile.querySelector(".browser-sound-play");
  if (activeBrowserSoundButton === playButton) {
    stopBrowserSoundPreview();
    return;
  }
  stopBrowserSoundPreview();
  const selection = browserSoundSelections.get(definition.type);
  const audio = new Audio(selection?.previewUrl || definition.sampleUrl);
  activeBrowserSoundAudio = audio;
  activeBrowserSoundButton = playButton;
  playButton.textContent = "Stop";
  playButton.classList.add("is-playing");
  const finish = () => {
    if (activeBrowserSoundAudio === audio) stopBrowserSoundPreview();
  };
  audio.addEventListener("ended", finish, { once: true });
  audio.addEventListener("error", () => {
    tile.querySelector(".browser-sound-status").textContent = "This sound could not be played";
    finish();
  }, { once: true });
  audio.play().catch(() => {
    tile.querySelector(".browser-sound-status").textContent = "This sound could not be played";
    finish();
  });
}

function createBrowserSoundTile(definition, index) {
  const tile = document.createElement("article");
  const inputId = `browser-sound-${index}`;
  tile.className = "browser-sound-tile";
  tile.dataset.browserSoundType = definition.type;
  tile.innerHTML = `
    <div class="browser-sound-heading">
      <span><span class="browser-sound-title"><strong>${definition.label}</strong><small class="cursor-source-badge">Sample</small></span><code>${definition.type}</code></span>
      <button class="browser-sound-play" type="button" aria-label="Play ${definition.label}">Play</button>
    </div>
    <input class="browser-sound-file-input" id="${inputId}" type="file" accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg">
    <label class="browser-sound-dropzone" for="${inputId}"><strong>Drop audio here</strong><small>or choose a local file</small></label>
    <div class="browser-sound-footer">
      <span class="browser-sound-status">${definition.sampleFile}</span>
      <button class="cursor-reset-button browser-sound-reset" type="button" hidden>Use sample</button>
    </div>`;
  const input = tile.querySelector(".browser-sound-file-input");
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) setBrowserSoundTileSelection(tile, definition, file);
  });
  tile.querySelector(".browser-sound-play").addEventListener("click", () => playBrowserSound(tile, definition));
  tile.querySelector(".browser-sound-reset").addEventListener("click", () => resetBrowserSoundTile(tile, definition));
  ["dragenter", "dragover"].forEach((eventName) => tile.addEventListener(eventName, (event) => {
    event.preventDefault();
    tile.classList.add("is-dragging");
  }));
  tile.addEventListener("dragleave", (event) => {
    if (!tile.contains(event.relatedTarget)) tile.classList.remove("is-dragging");
  });
  tile.addEventListener("drop", (event) => {
    event.preventDefault();
    tile.classList.remove("is-dragging");
    const file = event.dataTransfer?.files?.[0];
    if (file) setBrowserSoundTileSelection(tile, definition, file);
  });
  return tile;
}

function renderBrowserSoundsEditor() {
  if (browserSoundGrid.childElementCount) return;
  BROWSER_SOUND_DEFINITIONS.forEach((definition, index) => {
    browserSoundGrid.append(createBrowserSoundTile(definition, index));
  });
  updateBrowserSoundChangeCount();
}

function updateSavedBrowserSoundsSummary() {
  const saved = modBuildState.browserSounds;
  savedBrowserSoundsSummary.replaceChildren();
  saved?.items.forEach((item) => {
    const summary = document.createElement("span");
    summary.textContent = `${item.type} ← ${item.file.name}`;
    savedBrowserSoundsSummary.append(summary);
  });
  savedBrowserSoundsBox.hidden = !saved;
  browserSoundsCategoryCard.classList.toggle("has-saved-data", Boolean(saved));
  updateCreateModAvailability();
}

browserSoundSaveButton.addEventListener("click", () => {
  if (!browserSoundSelections.size) return;
  const items = BROWSER_SOUND_DEFINITIONS
    .filter((definition) => browserSoundSelections.has(definition.type))
    .map((definition) => {
      const selection = browserSoundSelections.get(definition.type);
      return {
        file: selection.file,
        path: `sound/${browserSoundFileName(definition.type, selection.extension)}`,
        type: definition.type
      };
    });
  modBuildState.browserSounds = { items };
  updateSavedBrowserSoundsSummary();
  browserSoundSaveStatus.textContent = `Saved ${items.length} browser ${items.length === 1 ? "sound" : "sounds"} successfully`;
});

const KEYBOARD_SOUND_DEFINITIONS = [
  { type: "TYPING_BACKSPACE", label: "Backspace", slot: "backspace", sampleFiles: ["backspace.wav"] },
  { type: "TYPING_ENTER", label: "Enter", slot: "enter", sampleFiles: ["enter.wav"] },
  { type: "TYPING_LETTER", label: "Letter variations", slot: "letter", sampleFiles: ["letter_1.wav", "letter_2.wav", "letter_3.wav"], multiple: true },
  { type: "TYPING_SPACE", label: "Space", slot: "space", sampleFiles: ["space.wav"] }
];

const keyboardSoundGrid = document.querySelector("#keyboard-sound-grid");
const keyboardSoundChangeCount = document.querySelector("#keyboard-sound-change-count");
const keyboardSoundSaveButton = document.querySelector("#save-keyboard-sounds");
const keyboardSoundSaveStatus = document.querySelector("#keyboard-sound-save-status");
const savedKeyboardSoundsBox = document.querySelector("#saved-keyboard-sounds-box");
const savedKeyboardSoundsSummary = document.querySelector("#saved-keyboard-sounds-summary");
const keyboardSoundsCategoryCard = document.querySelector('[data-category="Keyboard sounds"]');
const keyboardSoundSelections = new Map();
const keyboardSoundPlaybackIndexes = new Map();
let activeKeyboardSoundAudio = null;
let activeKeyboardSoundButton = null;

function keyboardSoundFileName(slot, extension = "wav") {
  return `${slot}.${extension}`;
}

function stopKeyboardSoundPreview() {
  if (activeKeyboardSoundAudio) {
    activeKeyboardSoundAudio.pause();
    activeKeyboardSoundAudio.currentTime = 0;
    activeKeyboardSoundAudio = null;
  }
  if (activeKeyboardSoundButton) {
    activeKeyboardSoundButton.textContent = "Play";
    activeKeyboardSoundButton.classList.remove("is-playing");
    activeKeyboardSoundButton = null;
  }
}

function updateKeyboardSoundChangeCount() {
  const count = Array.from(keyboardSoundSelections.values()).reduce((total, selections) => total + selections.length, 0);
  keyboardSoundChangeCount.textContent = count
    ? `${count} custom keyboard ${count === 1 ? "sound" : "sounds"} selected`
    : "No custom keyboard sounds selected";
  keyboardSoundSaveButton.disabled = count === 0;
  keyboardSoundSaveStatus.textContent = "";
}

function setKeyboardSoundTileSelection(tile, definition, files, append = false) {
  const validFiles = Array.from(files).filter((file) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return extension && ["mp3", "wav", "ogg"].includes(extension);
  });
  if (!validFiles.length) {
    tile.querySelector(".browser-sound-status").textContent = "Choose an MP3, WAV, or OGG file";
    return;
  }
  const previous = keyboardSoundSelections.get(definition.slot) || [];
  if (!append) previous.forEach((selection) => URL.revokeObjectURL(selection.previewUrl));
  const selections = append ? [...previous] : [];
  validFiles.forEach((file) => {
    selections.push({
      extension: file.name.split(".").pop().toLowerCase(),
      file,
      previewUrl: URL.createObjectURL(file)
    });
  });
  keyboardSoundSelections.set(definition.slot, selections);
  tile.classList.add("has-custom-sound");
  tile.querySelector(".cursor-source-badge").textContent = "Custom";
  tile.querySelector(".browser-sound-status").textContent = selections.map((selection) => selection.file.name).join(", ");
  tile.querySelector(".browser-sound-reset").hidden = false;
  updateKeyboardSoundChangeCount();
}

function resetKeyboardSoundTile(tile, definition) {
  stopKeyboardSoundPreview();
  const selections = keyboardSoundSelections.get(definition.slot) || [];
  selections.forEach((selection) => URL.revokeObjectURL(selection.previewUrl));
  keyboardSoundSelections.delete(definition.slot);
  keyboardSoundPlaybackIndexes.delete(definition.slot);
  tile.classList.remove("has-custom-sound", "is-dragging");
  tile.querySelector(".cursor-source-badge").textContent = "Sample";
  tile.querySelector(".browser-sound-status").textContent = definition.sampleFiles.join(", ");
  tile.querySelector(".browser-sound-reset").hidden = true;
  tile.querySelector(".browser-sound-file-input").value = "";
  const addInput = tile.querySelector(".keyboard-sound-add-input");
  if (addInput) addInput.value = "";
  updateKeyboardSoundChangeCount();
}

function playKeyboardSound(tile, definition) {
  const playButton = tile.querySelector(".browser-sound-play");
  if (activeKeyboardSoundButton === playButton) {
    stopKeyboardSoundPreview();
    return;
  }
  stopKeyboardSoundPreview();
  const selections = keyboardSoundSelections.get(definition.slot) || [];
  const sources = selections.length
    ? selections.map((selection) => selection.previewUrl)
    : definition.sampleFiles.map((fileName) => `ModTemplate2.0/keyboard/${fileName}`);
  const sourceIndex = keyboardSoundPlaybackIndexes.get(definition.slot) || 0;
  keyboardSoundPlaybackIndexes.set(definition.slot, (sourceIndex + 1) % sources.length);
  const audio = new Audio(sources[sourceIndex % sources.length]);
  activeKeyboardSoundAudio = audio;
  activeKeyboardSoundButton = playButton;
  playButton.textContent = "Stop";
  playButton.classList.add("is-playing");
  const finish = () => {
    if (activeKeyboardSoundAudio === audio) stopKeyboardSoundPreview();
  };
  audio.addEventListener("ended", finish, { once: true });
  audio.addEventListener("error", () => {
    tile.querySelector(".browser-sound-status").textContent = "This sound could not be played";
    finish();
  }, { once: true });
  audio.play().catch(() => {
    tile.querySelector(".browser-sound-status").textContent = "This sound could not be played";
    finish();
  });
}

function createKeyboardSoundTile(definition, index) {
  const tile = document.createElement("article");
  const inputId = `keyboard-sound-${index}`;
  const addInputId = `keyboard-sound-add-${index}`;
  tile.className = "browser-sound-tile";
  tile.dataset.keyboardSoundSlot = definition.slot;
  tile.innerHTML = `
    <div class="browser-sound-heading">
      <span><span class="browser-sound-title"><strong>${definition.label}</strong><small class="cursor-source-badge">Sample</small></span><code>${definition.type}</code></span>
      <button class="browser-sound-play" type="button" aria-label="Play ${definition.label}">Play</button>
    </div>
    <input class="browser-sound-file-input" id="${inputId}" type="file" accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg">
    <label class="browser-sound-dropzone" for="${inputId}"><strong>Drop audio here</strong><small>or choose a local file</small></label>
    ${definition.multiple ? `<input class="browser-sound-file-input keyboard-sound-add-input" id="${addInputId}" type="file" accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg" multiple><label class="keyboard-sound-add-button" for="${addInputId}">＋ Add more sounds</label>` : ""}
    <div class="browser-sound-footer">
      <span class="browser-sound-status">${definition.sampleFiles.join(", ")}</span>
      <button class="cursor-reset-button browser-sound-reset" type="button" hidden>Use sample</button>
    </div>`;
  const input = tile.querySelector(".browser-sound-file-input");
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) setKeyboardSoundTileSelection(tile, definition, [file]);
  });
  const addInput = tile.querySelector(".keyboard-sound-add-input");
  addInput?.addEventListener("change", () => {
    if (addInput.files?.length) setKeyboardSoundTileSelection(tile, definition, addInput.files, true);
  });
  tile.querySelector(".browser-sound-play").addEventListener("click", () => playKeyboardSound(tile, definition));
  tile.querySelector(".browser-sound-reset").addEventListener("click", () => resetKeyboardSoundTile(tile, definition));
  ["dragenter", "dragover"].forEach((eventName) => tile.addEventListener(eventName, (event) => {
    event.preventDefault();
    tile.classList.add("is-dragging");
  }));
  tile.addEventListener("dragleave", (event) => {
    if (!tile.contains(event.relatedTarget)) tile.classList.remove("is-dragging");
  });
  tile.addEventListener("drop", (event) => {
    event.preventDefault();
    tile.classList.remove("is-dragging");
    const file = event.dataTransfer?.files?.[0];
    if (file) setKeyboardSoundTileSelection(tile, definition, [file]);
  });
  return tile;
}

function renderKeyboardSoundsEditor() {
  if (keyboardSoundGrid.childElementCount) return;
  KEYBOARD_SOUND_DEFINITIONS.forEach((definition, index) => {
    keyboardSoundGrid.append(createKeyboardSoundTile(definition, index));
  });
  updateKeyboardSoundChangeCount();
}

function updateSavedKeyboardSoundsSummary() {
  const saved = modBuildState.keyboardSounds;
  savedKeyboardSoundsSummary.replaceChildren();
  saved?.items.forEach((item) => {
    const summary = document.createElement("span");
    summary.textContent = `${item.type} (${item.slot}) ← ${item.file.name}`;
    savedKeyboardSoundsSummary.append(summary);
  });
  savedKeyboardSoundsBox.hidden = !saved;
  keyboardSoundsCategoryCard.classList.toggle("has-saved-data", Boolean(saved));
  updateCreateModAvailability();
}

keyboardSoundSaveButton.addEventListener("click", () => {
  if (!keyboardSoundSelections.size) return;
  const items = KEYBOARD_SOUND_DEFINITIONS
    .filter((definition) => keyboardSoundSelections.has(definition.slot))
    .flatMap((definition) => keyboardSoundSelections.get(definition.slot).map((selection, index) => {
      const outputSlot = definition.multiple ? `${definition.slot}_${index + 1}` : definition.slot;
      return {
        file: selection.file,
        path: `keyboard/${keyboardSoundFileName(outputSlot, selection.extension)}`,
        slot: outputSlot,
        type: definition.type
      };
    }));
  modBuildState.keyboardSounds = { items };
  updateSavedKeyboardSoundsSummary();
  keyboardSoundSaveStatus.textContent = `Saved ${items.length} keyboard ${items.length === 1 ? "sound" : "sounds"} successfully`;
});

const fontSelections = { header: [], body: [] };
const fontInputs = {
  header: document.querySelector("#header-font-input"),
  body: document.querySelector("#body-font-input")
};
const fontLists = {
  header: document.querySelector('[data-font-list="header"]'),
  body: document.querySelector('[data-font-list="body"]')
};
const fontPreviews = {
  header: document.querySelector(".font-header-preview"),
  body: document.querySelector(".font-body-preview")
};
const fontChangeCount = document.querySelector("#font-change-count");
const fontSaveButton = document.querySelector("#save-fonts");
const fontSaveStatus = document.querySelector("#font-save-status");
const savedFontsBox = document.querySelector("#saved-fonts-box");
const savedFontsSummary = document.querySelector("#saved-fonts-summary");
const fontsCategoryCard = document.querySelector('[data-category="Fonts"]');
let fontFamilySequence = 0;

function fontDisplayName(fileName) {
  return fileName.replace(/\.ttf$/i, "").replace(/[_-]+/g, " ").trim() || "Custom font";
}

function updateFontChangeCount() {
  const count = fontSelections.header.length + fontSelections.body.length;
  fontChangeCount.textContent = count
    ? `${count} custom font ${count === 1 ? "file" : "files"} selected`
    : "No custom fonts selected";
  fontSaveButton.disabled = count === 0;
  fontSaveStatus.textContent = "";
}

function updateFontPreview(role) {
  const latest = fontSelections[role].at(-1);
  fontPreviews[role].style.fontFamily = latest
    ? `"${latest.family}", sans-serif`
    : '"GX Builder Mephisto", sans-serif';
  document.querySelector(`[data-font-role="${role}"] .cursor-source-badge`).textContent = latest
    ? fontDisplayName(latest.file.name)
    : "Mephisto default";
}

function removeFontSelection(role, selection) {
  const index = fontSelections[role].indexOf(selection);
  if (index === -1) return;
  fontSelections[role].splice(index, 1);
  document.fonts.delete(selection.fontFace);
  URL.revokeObjectURL(selection.previewUrl);
  renderFontSelectionList(role);
  updateFontPreview(role);
  updateFontChangeCount();
}

function renderFontSelectionList(role) {
  fontLists[role].replaceChildren();
  fontSelections[role].forEach((selection) => {
    const item = document.createElement("div");
    item.className = "font-selection-item";
    const name = document.createElement("span");
    name.textContent = selection.file.name;
    const removeButton = document.createElement("button");
    removeButton.className = "font-selection-remove";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeFontSelection(role, selection));
    item.append(name, removeButton);
    fontLists[role].append(item);
  });
}

async function addFontFiles(role, files) {
  const rejected = [];
  for (const file of Array.from(files)) {
    if (!/\.ttf$/i.test(file.name)) {
      rejected.push(file.name);
      continue;
    }
    const previewUrl = URL.createObjectURL(file);
    const family = `GXBuilderFont${fontFamilySequence += 1}`;
    const fontFace = new FontFace(family, `url("${previewUrl}") format("truetype")`);
    try {
      await fontFace.load();
      document.fonts.add(fontFace);
      fontSelections[role].push({ family, file, fontFace, previewUrl });
    } catch {
      URL.revokeObjectURL(previewUrl);
      rejected.push(file.name);
    }
  }
  renderFontSelectionList(role);
  updateFontPreview(role);
  updateFontChangeCount();
  if (rejected.length) fontSaveStatus.textContent = `Could not load: ${rejected.join(", ")}`;
}

Object.entries(fontInputs).forEach(([role, input]) => {
  input.addEventListener("change", async () => {
    if (input.files?.length) await addFontFiles(role, input.files);
    input.value = "";
  });
});

function updateSavedFontsSummary() {
  savedFontsSummary.replaceChildren();
  for (const role of ["header", "body"]) {
    const savedRole = modBuildState.fonts?.[role];
    if (!savedRole) continue;
    const summary = document.createElement("span");
    summary.textContent = `${role.toUpperCase()} · ${savedRole.items.length} ${savedRole.items.length === 1 ? "variant" : "variants"}`;
    savedFontsSummary.append(summary);
  }
  savedFontsBox.hidden = !modBuildState.fonts;
  fontsCategoryCard.classList.toggle("has-saved-data", Boolean(modBuildState.fonts));
  updateCreateModAvailability();
}

fontSaveButton.addEventListener("click", () => {
  const saved = {};
  for (const role of ["header", "body"]) {
    if (!fontSelections[role].length) continue;
    saved[role] = {
      items: fontSelections[role].map((selection) => ({ family: selection.family, file: selection.file })),
      name: fontDisplayName(fontSelections[role][0].file.name)
    };
  }
  if (!Object.keys(saved).length) return;
  modBuildState.fonts = saved;
  updateSavedFontsSummary();
  const count = Object.values(saved).reduce((total, role) => total + role.items.length, 0);
  fontSaveStatus.textContent = `Saved ${count} font ${count === 1 ? "file" : "files"} successfully`;
});

const splashFileInput = document.querySelector("#splash-file");
const splashDropzone = document.querySelector("#splash-dropzone");
const splashDropStatus = document.querySelector("#splash-drop-status");
const splashPreviewVideo = document.querySelector("#splash-preview-video");
const splashVideoFrame = document.querySelector("#splash-video-frame");
const splashPreviewName = document.querySelector("#splash-preview-name");
const splashPreviewDimensions = document.querySelector("#splash-preview-dimensions");
const splashSaveCopy = document.querySelector("#splash-save-copy");
const splashSaveButton = document.querySelector("#save-splash");
const splashSaveStatus = document.querySelector("#splash-save-status");
const savedSplashBox = document.querySelector("#saved-splash-box");
const savedSplashSummary = document.querySelector("#saved-splash-summary");
const splashCategoryCard = document.querySelector('[data-category="Splash screen"]');
const defaultSplashSelection = {
  file: null,
  height: 0,
  name: "splash1.mp4",
  source: "default",
  url: "ModTemplate2.0/splash/splash1.mp4",
  width: 0
};
let splashSelection = { ...defaultSplashSelection };

function updateSplashVideoDimensions() {
  const width = splashPreviewVideo.videoWidth;
  const height = splashPreviewVideo.videoHeight;
  if (!width || !height) return;
  splashSelection.width = width;
  splashSelection.height = height;
  splashVideoFrame.style.aspectRatio = `${width} / ${height}`;
  splashPreviewDimensions.textContent = `${width}×${height}`;
}

function renderSplashEditor() {
  if (splashPreviewVideo.src !== new URL(splashSelection.url, document.baseURI).href) {
    splashPreviewVideo.src = splashSelection.url;
    splashPreviewVideo.load();
  }
  splashPreviewName.textContent = splashSelection.name;
  splashPreviewDimensions.textContent = splashSelection.width
    ? `${splashSelection.width}×${splashSelection.height}`
    : "Loading…";
  if (splashSelection.width) splashVideoFrame.style.aspectRatio = `${splashSelection.width} / ${splashSelection.height}`;
  splashSaveCopy.textContent = splashSelection.source === "default"
    ? "Template splash screen selected"
    : "Custom splash screen selected";
}

function selectSplashFile(file) {
  if (!/\.mp4$/i.test(file.name)) {
    splashDropStatus.textContent = "Choose an MP4 video file.";
    return;
  }
  splashPreviewVideo.pause();
  splashSelection = {
    file,
    height: 0,
    name: file.name,
    source: "upload",
    url: URL.createObjectURL(file),
    width: 0
  };
  splashDropStatus.textContent = `${file.name} is ready to preview with sound.`;
  splashSaveStatus.textContent = "";
  renderSplashEditor();
}

splashPreviewVideo.addEventListener("loadedmetadata", updateSplashVideoDimensions);
splashFileInput.addEventListener("change", () => {
  if (splashFileInput.files?.[0]) selectSplashFile(splashFileInput.files[0]);
  splashFileInput.value = "";
});

["dragenter", "dragover"].forEach((eventName) => {
  splashDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    splashDropzone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  splashDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    splashDropzone.classList.remove("is-dragging");
  });
});

splashDropzone.addEventListener("drop", (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (file) selectSplashFile(file);
});

function updateSavedSplashSummary() {
  const saved = modBuildState.splashScreen;
  savedSplashBox.hidden = !saved;
  splashCategoryCard.classList.toggle("has-saved-data", Boolean(saved));
  savedSplashSummary.textContent = saved
    ? `${saved.name} · ${saved.width}×${saved.height}`
    : "";
  updateCreateModAvailability();
}

splashSaveButton.addEventListener("click", () => {
  if (!splashSelection.width || !splashSelection.height) {
    splashSaveStatus.textContent = "Wait for the video dimensions to finish loading.";
    return;
  }
  modBuildState.splashScreen = { ...splashSelection };
  updateSavedSplashSummary();
  splashSaveStatus.textContent = "Splash screen saved successfully";
});

const CURSOR_GROUPS = [
  {
    name: "Basic cursors",
    key: "basic",
    items: [
      ["POINTER", "Default pointer", "Standard arrow for general browsing"]
    ]
  },
  {
    name: "Interactive cursors",
    key: "interactive",
    items: [
      ["HAND", "Link select", "Clickable links and controls"],
      ["HELP", "Help", "More information or help is available"],
      ["CONTEXT_MENU", "Context menu", "A context menu is available"],
      ["PROGRESS", "Progress", "Work continues in the background"],
      ["WAIT", "Wait", "The browser is busy"]
    ]
  },
  {
    name: "Selection cursors",
    key: "selection",
    items: [
      ["CROSS", "Crosshair", "Precise selection point"],
      ["CELL", "Cell", "Table or spreadsheet cell selection"],
      ["I_BEAM", "Text", "Horizontal text selection"],
      ["VERTICAL_TEXT", "Vertical text", "Vertical text selection"]
    ]
  },
  {
    name: "Drag cursors",
    key: "drag",
    items: [
      ["GRAB", "Grab", "Item is ready to be dragged"],
      ["GRABBING", "Grabbing", "Item is being dragged"],
      ["MOVE", "Move", "Move in any direction"],
      ["COPY", "Copy", "Dragged item will be copied"],
      ["ALIAS", "Alias", "Create a shortcut or alias"],
      ["NO_DROP", "No drop", "Invalid drop target"],
      ["NOT_ALLOWED", "Not allowed", "Action is unavailable"]
    ]
  },
  {
    name: "Resize cursors",
    key: "resize",
    items: [
      ["COLUMN_RESIZE", "Column resize", "Resize a column"],
      ["ROW_RESIZE", "Row resize", "Resize a row"],
      ["NORTH_RESIZE", "North resize", "Resize from the top edge"],
      ["EAST_RESIZE", "East resize", "Resize from the right edge"],
      ["SOUTH_RESIZE", "South resize", "Resize from the bottom edge"],
      ["WEST_RESIZE", "West resize", "Resize from the left edge"],
      ["NORTH_EAST_RESIZE", "Northeast resize", "Resize from the top-right corner"],
      ["NORTH_WEST_RESIZE", "Northwest resize", "Resize from the top-left corner"],
      ["SOUTH_EAST_RESIZE", "Southeast resize", "Resize from the bottom-right corner"],
      ["SOUTH_WEST_RESIZE", "Southwest resize", "Resize from the bottom-left corner"],
      ["EAST_WEST_RESIZE", "East-west resize", "Resize horizontally"],
      ["NORTH_SOUTH_RESIZE", "North-south resize", "Resize vertically"],
      ["NORTH_EAST_SOUTH_WEST_RESIZE", "Northeast-southwest resize", "Resize diagonally from northeast to southwest"],
      ["NORTH_WEST_SOUTH_EAST_RESIZE", "Northwest-southeast resize", "Resize diagonally from northwest to southeast"]
    ]
  },
  {
    name: "Panning cursors",
    key: "panning",
    items: [
      ["MIDDLE_PANNING", "Pan in any direction", "Middle-button panning in all directions"],
      ["MIDDLE_PANNING_HORIZONTAL", "Pan horizontally", "Middle-button horizontal panning"],
      ["MIDDLE_PANNING_VERTICAL", "Pan vertically", "Middle-button vertical panning"],
      ["NORTH_PANNING", "Pan north", "Scroll or pan upward"],
      ["NORTH_EAST_PANNING", "Pan northeast", "Scroll or pan toward the upper right"],
      ["EAST_PANNING", "Pan east", "Scroll or pan right"],
      ["SOUTH_EAST_PANNING", "Pan southeast", "Scroll or pan toward the lower right"],
      ["SOUTH_PANNING", "Pan south", "Scroll or pan downward"],
      ["SOUTH_WEST_PANNING", "Pan southwest", "Scroll or pan toward the lower left"],
      ["WEST_PANNING", "Pan west", "Scroll or pan left"],
      ["NORTH_WEST_PANNING", "Pan northwest", "Scroll or pan toward the upper left"]
    ]
  },
  {
    name: "Unavailable resize cursors",
    key: "blocked",
    items: [
      ["EAST_WEST_NO_RESIZE", "Horizontal resize unavailable", "Horizontal resizing is blocked"],
      ["NORTH_SOUTH_NO_RESIZE", "Vertical resize unavailable", "Vertical resizing is blocked"],
      ["NORTH_EAST_SOUTH_WEST_NO_RESIZE", "Northeast-southwest unavailable", "This diagonal resize is blocked"],
      ["NORTH_WEST_SOUTH_EAST_NO_RESIZE", "Northwest-southeast unavailable", "This diagonal resize is blocked"]
    ]
  },
  {
    name: "Zoom cursors",
    key: "zoom",
    items: [
      ["ZOOM_IN", "Zoom in", "Content can be enlarged"],
      ["ZOOM_OUT", "Zoom out", "Content can be reduced"]
    ]
  }
];

const cursorDefinitions = CURSOR_GROUPS.flatMap((group) => group.items.map(([type, label, description]) => ({
  description,
  group: group.key,
  label,
  type
})));
const cursorGroupsContainer = document.querySelector("#cursor-groups");
const cursorSaveButton = document.querySelector("#save-cursors");
const cursorSaveStatus = document.querySelector("#cursor-save-status");
const cursorChangeCount = document.querySelector("#cursor-change-count");
const cursorSelections = new Map();
const cursorPreviewStates = new Map();
const cursorPreviewTokens = new Map();
let savedCursorPreviewUrl = null;
const savedCursorsBox = document.querySelector("#saved-cursors-box");
const savedCursorsSummary = document.querySelector("#saved-cursors-summary");
const cursorCategoryCard = document.querySelector('[data-category="Cursors"]');

function cursorFileName(type, extension = "cur") {
  return `${type.toLowerCase()}.${extension}`;
}

function readFourCc(view, offset) {
  return String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
}

function isPngAt(view, offset) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return signature.every((value, index) => view.getUint8(offset + index) === value);
}

function extractCursorFrameBlob(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 22 || view.getUint16(0, true) !== 0 || ![1, 2].includes(view.getUint16(2, true))) {
    throw new Error("The file does not contain a valid Windows cursor image");
  }

  const count = view.getUint16(4, true);
  const entries = [];
  for (let index = 0; index < count; index += 1) {
    const entryOffset = 6 + index * 16;
    if (entryOffset + 16 > view.byteLength) {
      break;
    }
    const width = view.getUint8(entryOffset) || 256;
    const height = view.getUint8(entryOffset + 1) || 256;
    entries.push({
      area: width * height,
      offset: view.getUint32(entryOffset + 12, true),
      size: view.getUint32(entryOffset + 8, true)
    });
  }

  entries.sort((left, right) => right.area - left.area);
  const pngEntry = entries.find((entry) => entry.offset + 8 <= view.byteLength && isPngAt(view, entry.offset));
  if (pngEntry && pngEntry.offset + pngEntry.size <= view.byteLength) {
    return new Blob([buffer.slice(pngEntry.offset, pngEntry.offset + pngEntry.size)], { type: "image/png" });
  }

  return new Blob([buffer], { type: "image/x-icon" });
}

function parseAniFrames(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 12 || readFourCc(view, 0) !== "RIFF" || readFourCc(view, 8) !== "ACON") {
    throw new Error("The file does not contain a valid animated Windows cursor");
  }

  const frames = [];
  const rates = [];
  const sequence = [];
  let defaultRate = 6;

  function readChunks(start, end) {
    let offset = start;
    while (offset + 8 <= end && offset + 8 <= view.byteLength) {
      const id = readFourCc(view, offset);
      const size = view.getUint32(offset + 4, true);
      const dataStart = offset + 8;
      const dataEnd = Math.min(dataStart + size, view.byteLength);

      if (id === "anih" && size >= 32) {
        defaultRate = view.getUint32(dataStart + 28, true) || defaultRate;
      } else if (id === "rate") {
        for (let itemOffset = dataStart; itemOffset + 4 <= dataEnd; itemOffset += 4) {
          rates.push(view.getUint32(itemOffset, true));
        }
      } else if (id === "seq ") {
        for (let itemOffset = dataStart; itemOffset + 4 <= dataEnd; itemOffset += 4) {
          sequence.push(view.getUint32(itemOffset, true));
        }
      } else if (id === "icon") {
        frames.push(buffer.slice(dataStart, dataEnd));
      } else if (id === "LIST" && dataStart + 4 <= dataEnd) {
        readChunks(dataStart + 4, dataEnd);
      }

      offset = dataStart + size + (size % 2);
    }
  }

  readChunks(12, view.byteLength);
  if (frames.length === 0) {
    throw new Error("No cursor frames were found in this ANI file");
  }

  const orderedFrames = sequence.length
    ? sequence.map((index) => frames[index]).filter(Boolean)
    : frames;
  const rate = rates[0] || defaultRate;
  return {
    frameDuration: Math.max(32, Math.round(rate * (1000 / 60))),
    frames: orderedFrames
  };
}

async function loadCursorPreview(source, fileName) {
  const buffer = source instanceof File
    ? await source.arrayBuffer()
    : await fetch(source).then((response) => {
      if (!response.ok) {
        throw new Error("The included Pink cursor could not be loaded");
      }
      return response.arrayBuffer();
    });
  const extension = fileName.split(".").pop()?.toLowerCase();
  const animation = extension === "ani"
    ? parseAniFrames(buffer)
    : { frameDuration: 0, frames: [buffer] };
  const frameUrls = animation.frames.map((frame) => URL.createObjectURL(extractCursorFrameBlob(frame)));
  const cursorUrl = source instanceof File ? URL.createObjectURL(source) : source;
  return {
    cursorUrl,
    frameDuration: animation.frameDuration,
    frameUrls,
    ownedUrls: source instanceof File ? [...frameUrls, cursorUrl] : frameUrls
  };
}

function clearCursorPreviewState(type) {
  const state = cursorPreviewStates.get(type);
  if (!state) {
    return;
  }
  window.clearInterval(state.timer);
  state.ownedUrls.forEach((url) => URL.revokeObjectURL(url));
  cursorPreviewStates.delete(type);
}

async function setCursorTilePreview(tile, source, fileName) {
  const type = tile.dataset.cursorType;
  const token = Symbol(type);
  cursorPreviewTokens.set(type, token);
  const preview = await loadCursorPreview(source, fileName);
  if (cursorPreviewTokens.get(type) !== token) {
    preview.ownedUrls.forEach((url) => URL.revokeObjectURL(url));
    return false;
  }

  clearCursorPreviewState(type);
  const image = tile.querySelector(".cursor-preview-image");
  const dropzone = tile.querySelector(".cursor-dropzone");
  let frameIndex = 0;
  image.hidden = false;
  image.src = preview.frameUrls[0];
  dropzone.style.cursor = `url("${preview.cursorUrl}"), pointer`;
  const timer = preview.frameUrls.length > 1
    ? window.setInterval(() => {
      frameIndex = (frameIndex + 1) % preview.frameUrls.length;
      image.src = preview.frameUrls[frameIndex];
    }, preview.frameDuration)
    : null;
  cursorPreviewStates.set(type, { ...preview, timer });
  return true;
}

function updateCursorChangeCount() {
  const count = cursorSelections.size;
  cursorChangeCount.textContent = count === 0
    ? "No custom cursor files selected"
    : `${count} custom ${count === 1 ? "cursor" : "cursors"} ready to save`;
  cursorSaveButton.disabled = count === 0;
}

async function selectCursorFile(tile, file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const status = tile.querySelector(".cursor-tile-status");
  if (!['cur', 'ani'].includes(extension)) {
    status.textContent = "Only .cur or .ani files are allowed";
    tile.classList.add("has-error");
    return;
  }

  tile.classList.remove("has-error");
  status.textContent = "Reading cursor preview…";
  try {
    await setCursorTilePreview(tile, file, file.name);
    cursorSelections.set(tile.dataset.cursorType, { extension, file });
    tile.classList.add("has-custom-cursor");
    tile.querySelector(".cursor-source-badge").textContent = "Custom";
    tile.querySelector(".cursor-reset-button").hidden = false;
    status.textContent = file.name;
    cursorSaveStatus.textContent = "";
    updateCursorChangeCount();
  } catch (error) {
    status.textContent = error.message || "This cursor file could not be previewed";
    tile.classList.add("has-error");
  }
}

async function resetCursorTile(tile) {
  const type = tile.dataset.cursorType;
  cursorSelections.delete(type);
  tile.classList.remove("has-custom-cursor", "has-error");
  tile.querySelector(".cursor-source-badge").textContent = "Pink";
  tile.querySelector(".cursor-reset-button").hidden = true;
  tile.querySelector(".cursor-file-input").value = "";
  tile.querySelector(".cursor-tile-status").textContent = "Included default";
  cursorSaveStatus.textContent = "";
  updateCursorChangeCount();
  await setCursorTilePreview(tile, `ModTemplate2.0/cursors/Pink/${cursorFileName(type)}`, cursorFileName(type));
}

function createCursorTile(definition) {
  const tile = document.createElement("article");
  const inputId = `cursor-file-${definition.type.toLowerCase()}`;
  tile.className = "cursor-tile";
  tile.dataset.cursorType = definition.type;
  tile.innerHTML = `
    <input class="cursor-file-input" id="${inputId}" type="file" accept=".cur,.ani">
    <label class="cursor-dropzone" for="${inputId}">
      <span class="cursor-preview-frame"><img class="cursor-preview-image" alt="${definition.label} cursor preview"><b aria-hidden="true">＋</b></span>
      <span class="cursor-tile-copy">
        <span class="cursor-tile-title"><strong>${definition.label}</strong><small class="cursor-source-badge">Pink</small></span>
        <span>${definition.description}</span>
        <code>${definition.type}</code>
      </span>
    </label>
    <div class="cursor-tile-footer">
      <span class="cursor-tile-status" role="status" aria-live="polite">Included default</span>
      <button class="cursor-reset-button" type="button" hidden>Use Pink</button>
    </div>`;

  const input = tile.querySelector(".cursor-file-input");
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) {
      selectCursorFile(tile, file);
    }
  });
  tile.addEventListener("dragover", (event) => {
    event.preventDefault();
    tile.classList.add("is-dragging");
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  });
  tile.addEventListener("dragleave", (event) => {
    if (!tile.contains(event.relatedTarget)) {
      tile.classList.remove("is-dragging");
    }
  });
  tile.addEventListener("drop", (event) => {
    event.preventDefault();
    tile.classList.remove("is-dragging");
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      selectCursorFile(tile, file);
    }
  });
  tile.querySelector(".cursor-reset-button").addEventListener("click", () => resetCursorTile(tile));
  setCursorTilePreview(tile, `ModTemplate2.0/cursors/Pink/${cursorFileName(definition.type)}`, cursorFileName(definition.type))
    .catch(() => {
      tile.querySelector(".cursor-tile-status").textContent = "Default preview unavailable";
      tile.classList.add("has-error");
    });
  return tile;
}

function renderCursorEditor() {
  if (cursorGroupsContainer.childElementCount > 0) {
    return;
  }
  CURSOR_GROUPS.forEach((group) => {
    const section = document.createElement("section");
    section.className = "cursor-group";
    section.dataset.group = group.key;
    const heading = document.createElement("div");
    heading.className = "cursor-group-heading";
    heading.innerHTML = `<div><p class="section-index">${group.key}</p><h3>${group.name} <span>(${group.items.length})</span></h3></div><p>Click a tile or drop a Windows cursor file onto it.</p>`;
    const grid = document.createElement("div");
    grid.className = "cursor-grid";
    group.items.forEach(([type]) => {
      grid.append(createCursorTile(cursorDefinitions.find((definition) => definition.type === type)));
    });
    section.append(heading, grid);
    cursorGroupsContainer.append(section);
  });
  updateCursorChangeCount();
}

function updateSavedCursorSummary() {
  const saved = modBuildState.cursors;
  savedCursorsBox.hidden = !saved;
  savedCursorsSummary.replaceChildren();
  saved?.items.forEach((item) => {
    const mapping = document.createElement("span");
    mapping.textContent = `${item.type} ← ${item.file.name}`;
    savedCursorsSummary.append(mapping);
  });
  cursorCategoryCard.classList.toggle("has-saved-data", Boolean(saved));
  updateCreateModAvailability();
}

async function createSavedCursorPreview(file) {
  const buffer = await file.arrayBuffer();
  const extension = file.name.split(".").pop()?.toLowerCase();
  const firstFrame = extension === "ani" ? parseAniFrames(buffer).frames[0] : buffer;
  return URL.createObjectURL(extractCursorFrameBlob(firstFrame));
}

cursorSaveButton.addEventListener("click", async () => {
  if (cursorSelections.size === 0) {
    return;
  }
  const items = cursorDefinitions.filter((definition) => cursorSelections.has(definition.type)).map((definition) => {
    const selection = cursorSelections.get(definition.type);
    const extension = selection.extension;
    return {
      file: selection.file,
      path: `cursors/MyCursor/${cursorFileName(definition.type, extension)}`,
      source: "upload",
      type: definition.type
    };
  });
  const previewItem = items.find((item) => item.type === "POINTER") || items[0];
  const nextPreviewUrl = await createSavedCursorPreview(previewItem.file);
  if (savedCursorPreviewUrl) {
    URL.revokeObjectURL(savedCursorPreviewUrl);
  }
  savedCursorPreviewUrl = nextPreviewUrl;
  modBuildState.cursors = {
    customCount: cursorSelections.size,
    items,
    previewFileName: previewItem.file.name,
    previewType: previewItem.type,
    previewUrl: savedCursorPreviewUrl
  };
  updateSavedCursorSummary();
  cursorSaveStatus.textContent = `Saved ${cursorSelections.size} cursor ${cursorSelections.size === 1 ? "file and mapping" : "files and mappings"} successfully`;
});

const musicTrackList = document.querySelector("#music-track-list");
const addMusicTrackButton = document.querySelector("#add-music-track");
const saveMusicTracksButton = document.querySelector("#save-music-tracks");
const musicSaveStatus = document.querySelector("#music-save-status");
const musicMediaSelections = new WeakMap();
const savedMusicBox = document.querySelector("#saved-music-box");
const savedMusicSummary = document.querySelector("#saved-music-summary");
const musicCategoryCard = document.querySelector('[data-category="Music editor"]');
let musicTrackUid = 1;
let musicConversionUid = 0;
let musicConverterPromise;
let musicConversionQueue = Promise.resolve();

function updateSavedMusicSummary() {
  savedMusicSummary.replaceChildren();
  modBuildState.music.tracks.forEach((track, index) => {
    const summary = document.createElement("span");
    const author = track.author ? ` · ${track.author}` : "";
    const mediaName = track.media ? ` · ${track.media.file.name}` : " · No media selected";
    summary.textContent = `Track ${index + 1} · ${track.songName}${author}${mediaName}`;
    savedMusicSummary.append(summary);
  });
  const hasSavedMusic = modBuildState.music.tracks.length > 0;
  savedMusicBox.hidden = !hasSavedMusic;
  musicCategoryCard.classList.toggle("has-saved-data", hasSavedMusic);
  updateCreateModAvailability();
}

function hasSavedModOptions() {
  const hasSavedAppIcon = Boolean(savedAppIconValue);
  const hasSavedTheme = Object.values(savedThemeValues).some(Boolean);
  const hasSavedWallpaper = Object.values(savedWallpaperSelections).some(Boolean);
  const hasSavedMusic = modBuildState.music.tracks.length > 0;
  const hasSavedBrowserSounds = Boolean(modBuildState.browserSounds);
  const hasSavedKeyboardSounds = Boolean(modBuildState.keyboardSounds);
  const hasSavedFonts = Boolean(modBuildState.fonts);
  const hasSavedSplash = Boolean(modBuildState.splashScreen);
  const hasSavedCursors = Boolean(modBuildState.cursors);
  return hasSavedAppIcon || hasSavedTheme || hasSavedWallpaper || hasSavedMusic || hasSavedBrowserSounds || hasSavedKeyboardSounds || hasSavedFonts || hasSavedSplash || hasSavedCursors;
}

function updateCreateModAvailability() {
  createModButton.disabled = !hasSavedModOptions();
}

function appendBuildSummaryGroup(title, description, items) {
  if (items.length === 0) {
    return;
  }

  const group = document.createElement("section");
  group.className = "build-summary-group";

  const heading = document.createElement("div");
  heading.className = "build-summary-heading";
  const headingTitle = document.createElement("h3");
  headingTitle.textContent = title;
  const headingDescription = document.createElement("p");
  headingDescription.textContent = description;
  heading.append(headingTitle, headingDescription);

  const list = document.createElement("div");
  list.className = "build-summary-list";
  items.forEach((item) => {
    const entry = document.createElement("article");
    const entryTitle = document.createElement("h4");
    entryTitle.textContent = item.title;
    const entryContent = document.createElement("div");
    entryContent.className = "build-summary-content";

    if (item.preview) {
      const preview = document.createElement("figure");
      preview.className = "build-summary-media";
      preview.dataset.kind = item.preview.kind;
      if (item.preview.shape) {
        preview.dataset.shape = item.preview.shape;
      }

      if (item.preview.kind === "video") {
        const video = document.createElement("video");
        video.src = item.preview.url;
        video.muted = !item.preview.controls;
        video.loop = !item.preview.controls;
        video.autoplay = !item.preview.controls;
        video.playsInline = true;
        video.controls = Boolean(item.preview.controls);
        video.preload = "metadata";
        video.setAttribute("aria-label", item.preview.alt);
        if (!item.preview.controls) video.play().catch(() => {});
        preview.append(video);
      } else if (item.preview.kind === "audio") {
        const audio = document.createElement("audio");
        audio.src = item.preview.url;
        audio.controls = true;
        audio.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback");
        audio.disableRemotePlayback = true;
        audio.preload = "metadata";
        audio.setAttribute("aria-label", item.preview.alt);
        preview.append(audio);
      } else if (item.preview.kind === "font") {
        const sample = document.createElement("p");
        sample.textContent = item.preview.text;
        sample.style.fontFamily = `"${item.preview.family}", sans-serif`;
        sample.setAttribute("aria-label", item.preview.alt);
        preview.append(sample);
      } else {
        const image = document.createElement("img");
        image.src = item.preview.url;
        image.alt = item.preview.alt;
        image.loading = "lazy";
        preview.append(image);
      }

      entryContent.append(preview);
    }

    const details = document.createElement("dl");
    item.details.forEach(({ label, value }) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const descriptionValue = document.createElement("dd");
      term.textContent = label;
      descriptionValue.textContent = value;
      row.append(term, descriptionValue);
      details.append(row);
    });
    entryContent.append(details);
    entry.append(entryTitle, entryContent);
    list.append(entry);
  });

  group.append(heading, list);
  buildSummaryGroups.append(group);
}

let buildReviewObjectUrls = [];

function renderBuildSummary() {
  buildReviewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  buildReviewObjectUrls = [];
  buildSummaryGroups.replaceChildren();

  const modIconItems = savedModIconValue
    ? [{
      title: "Mod icon",
      preview: {
        alt: `Preview of ${savedModIconValue.name}`,
        kind: "image",
        shape: "square",
        url: savedModIconValue.previewUrl
      },
      details: [
        { label: "File", value: savedModIconValue.name },
        { label: "Dimensions", value: `${savedModIconValue.width}×${savedModIconValue.height}` },
        { label: "Original", value: savedModIconValue.originalName },
        { label: "Corner curve", value: `${savedModIconValue.adjustments.cornerRadius}%` },
        { label: "Source", value: savedModIconValue.source === "default" ? "Default template icon" : "Local upload" }
      ]
    }]
    : [];
  appendBuildSummaryGroup("Mod icon", "Installed mod preview image", modIconItems);

  const appIconItems = savedAppIconValue
    ? [{
      title: "App icon",
      preview: {
        alt: `Preview of ${savedAppIconValue.name}`,
        kind: "image",
        shape: "square",
        url: savedAppIconValue.previewUrl
      },
      details: [
        { label: "File", value: savedAppIconValue.name },
        { label: "Dimensions", value: `${savedAppIconValue.width}×${savedAppIconValue.height}` },
        { label: "Corner curve", value: `${savedAppIconValue.adjustments.cornerRadius}%` },
        { label: "Source", value: savedAppIconValue.source === "included" ? "Sample app icon" : "Local upload" }
      ]
    }]
    : [];
  appendBuildSummaryGroup("App icon", "Saved mod identity image", appIconItems);

  const themeItems = Object.entries(savedThemeValues)
    .filter(([, values]) => values)
    .map(([mode, values]) => ({
      title: `${mode[0].toUpperCase() + mode.slice(1)} mode`,
      details: [
        { label: "GX accent", value: hslString(values.accent) },
        { label: "GX secondary base", value: hslString(values.secondary) }
      ]
    }));
  appendBuildSummaryGroup("Theme", "Saved Opera GX color palettes", themeItems);

  const wallpaperItems = Object.entries(savedWallpaperSelections)
    .filter(([, selection]) => selection)
    .map(([mode, selection]) => {
      const speedDial = isMobileWallpaperMode(mode) ? null : savedSpeedDialEffectValues[mode];
      const details = [
        { label: "Target", value: selection.device === "mobile" ? "Mobile" : "Desktop" },
        { label: "Manifest field", value: selection.manifestField },
        { label: "Type", value: selection.kind === "video" ? "Animated" : "Static" },
        { label: "File", value: selection.name },
        { label: "Source", value: selection.source === "included" ? `Sample ${selection.device} wallpaper` : "Local upload" }
      ];
      if (speedDial) {
        const enabledCount = Object.values(speedDial.enabled).filter(Boolean).length;
        details.push({ label: "Optional wallpaper settings", value: `${enabledCount} enabled` });
        if (speedDial.enabled.position) {
          details.push({ label: "Speed Dial position", value: speedDial.position });
        }
        if (speedDial.enabled.textColor) {
          details.push({ label: "Text color", value: speedDial.textColor.toUpperCase() });
        }
        if (speedDial.enabled.textShadow) {
          details.push({ label: "Text shadow", value: speedDial.textShadow.toUpperCase() });
        }
        if (speedDial.enabled.backgroundBlur) {
          details.push({ label: "Background blur", value: String(speedDial.backgroundBlur) });
        }
        if (speedDial.enabled.backgroundOpacity) {
          details.push({ label: "Background opacity", value: String(speedDial.backgroundOpacity) });
        }
        if (speedDial.enabled.focusMode) {
          details.push({ label: "Focus mode", value: speedDial.focusMode ? "Enabled" : "Disabled" });
        }
        if (speedDial.enabled.islandsOpacity) {
          details.push({ label: "Islands opacity", value: String(speedDial.islandsOpacity) });
        }
        if (speedDial.enabled.vignetteStrength) {
          details.push({ label: "Vignette strength", value: String(speedDial.vignetteStrength) });
        }
      }
      return {
        title: getWallpaperModeLabel(mode),
        preview: {
          alt: `${getWallpaperModeLabel(mode)} wallpaper preview for ${selection.name}`,
          kind: selection.kind,
          url: selection.previewUrl
        },
        details
      };
    });
  appendBuildSummaryGroup("Wallpaper", "Saved wallpaper media and settings", wallpaperItems);

  const browserSoundItems = (modBuildState.browserSounds?.items || []).map((item) => {
    const audioPreviewUrl = URL.createObjectURL(item.file);
    buildReviewObjectUrls.push(audioPreviewUrl);
    return {
      title: item.type,
      preview: {
        alt: `Audio preview for ${item.type}`,
        kind: "audio",
        url: audioPreviewUrl
      },
      details: [
        { label: "Browser event", value: item.type },
        { label: "Saved audio", value: item.file.name },
        { label: "Manifest path", value: item.path }
      ]
    };
  });
  appendBuildSummaryGroup("Browser sounds", "Saved browser event audio", browserSoundItems);

  const keyboardSoundItems = (modBuildState.keyboardSounds?.items || []).map((item) => {
    const audioPreviewUrl = URL.createObjectURL(item.file);
    buildReviewObjectUrls.push(audioPreviewUrl);
    return {
      title: item.slot,
      preview: {
        alt: `Audio preview for ${item.slot}`,
        kind: "audio",
        url: audioPreviewUrl
      },
      details: [
        { label: "Keyboard event", value: item.type },
        { label: "Saved audio", value: item.file.name },
        { label: "Manifest path", value: item.path }
      ]
    };
  });
  appendBuildSummaryGroup("Keyboard sounds", "Saved typing feedback audio", keyboardSoundItems);

  const fontItems = ["header", "body"].flatMap((role) => {
    const savedRole = modBuildState.fonts?.[role];
    if (!savedRole) return [];
    return savedRole.items.map((item, index) => ({
      title: `${role} variant ${index + 1}`,
      preview: {
        alt: `${role} font preview`,
        family: item.family,
        kind: "font",
        text: role === "header" ? "The quick brown fox" : "Pack my box with five dozen liquor jugs"
      },
      details: [
        { label: "Font role", value: role },
        { label: "Font family", value: savedRole.name },
        { label: "Original file", value: item.file.name }
      ]
    }));
  });
  appendBuildSummaryGroup("Fonts", "Saved header and body font variants", fontItems);

  const splashItems = modBuildState.splashScreen
    ? [{
      title: "Splash screen",
      preview: {
        alt: `Splash screen preview for ${modBuildState.splashScreen.name}`,
        controls: true,
        kind: "video",
        url: modBuildState.splashScreen.url
      },
      details: [
        { label: "File", value: modBuildState.splashScreen.name },
        { label: "Dimensions", value: `${modBuildState.splashScreen.width}×${modBuildState.splashScreen.height}` },
        { label: "Audio", value: "Included" },
        { label: "Source", value: modBuildState.splashScreen.source === "default" ? "Template splash screen" : "Local MP4 upload" }
      ]
    }]
    : [];
  appendBuildSummaryGroup("Splash screen", "Saved browser startup video", splashItems);

  const musicItems = modBuildState.music.tracks.map((track, index) => {
    const details = [
      { label: "Song name", value: track.songName },
      { label: "Author", value: track.author || "Not provided" }
    ];
    if (track.media) {
      details.push(
        { label: "Saved audio", value: track.media.file.name },
        {
          label: "Source",
          value: track.media.convertedFromMp4
            ? `Converted from ${track.media.sourceName}`
            : "Local MP3 upload"
        }
      );
    } else {
      details.push({ label: "Saved audio", value: "No media selected" });
    }
    const audioPreviewUrl = track.media ? URL.createObjectURL(track.media.file) : null;
    if (audioPreviewUrl) {
      buildReviewObjectUrls.push(audioPreviewUrl);
    }
    return {
      title: `Track ${index + 1}`,
      preview: track.media ? {
        alt: `Audio preview for ${track.songName}`,
        kind: "audio",
        url: audioPreviewUrl
      } : null,
      details
    };
  });
  appendBuildSummaryGroup("Music", "Saved background music tracks", musicItems);

  const cursorItems = modBuildState.cursors
    ? [{
      title: "Cursor collection",
      preview: {
        alt: `${modBuildState.cursors.previewType} cursor preview from ${modBuildState.cursors.previewFileName}`,
        kind: "image",
        url: modBuildState.cursors.previewUrl
      },
      details: [
        { label: "Custom cursor roles", value: String(modBuildState.cursors.items.length) },
        { label: "Preview cursor", value: modBuildState.cursors.previewType },
        { label: "Source", value: "User-provided files only" },
        { label: "Accepted formats", value: ".cur and .ani" }
      ]
    }]
    : [];
  appendBuildSummaryGroup("Cursors", "Saved pointer collection", cursorItems);

}

function setMusicSaveAvailability() {
  const isConverting = [...musicTrackList.querySelectorAll(".music-track-card")]
    .some((card) => musicMediaSelections.get(card)?.isConverting);
  saveMusicTracksButton.disabled = isConverting;
}

function clearMusicMedia(card) {
  const selection = musicMediaSelections.get(card);
  if (selection?.previewUrl) {
    URL.revokeObjectURL(selection.previewUrl);
  }

  musicMediaSelections.delete(card);
  const audio = card.querySelector("audio");
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  card.querySelector(".music-media-selection").hidden = true;
  card.querySelector(".music-media-name").textContent = "";
  card.querySelector(".music-media-status").textContent = "";
  card.querySelector(".music-media-input").value = "";
  setMusicSaveAvailability();
}

function showMusicMedia(card, file, convertedFromMp4 = false, sourceFile = file) {
  const previewUrl = URL.createObjectURL(file);
  musicMediaSelections.set(card, {
    convertedFromMp4,
    file,
    isConverting: false,
    previewUrl,
    sourceName: sourceFile.name,
    sourceType: sourceFile.type
  });

  const audio = card.querySelector("audio");
  audio.src = previewUrl;
  card.querySelector(".music-media-name").textContent = file.name;
  card.querySelector(".music-media-selection").hidden = false;
  card.querySelector(".music-media-status").textContent = convertedFromMp4
    ? "MP4 audio converted to MP3 and ready to preview"
    : "MP3 ready to preview";
  setMusicSaveAvailability();
}

async function getMusicConverter() {
  if (!musicConverterPromise) {
    musicConverterPromise = (async () => {
      const [{ FFmpeg }, { fetchFile }] = await Promise.all([
        import("./vendor/ffmpeg/ffmpeg/index.js"),
        import("./vendor/ffmpeg/util/index.js")
      ]);
      const ffmpeg = new FFmpeg();
      const coreBaseUrl = new URL("./vendor/ffmpeg/core/", document.baseURI);
      await ffmpeg.load({
        coreURL: new URL("ffmpeg-core.js", coreBaseUrl).href,
        wasmURL: new URL("ffmpeg-core.wasm", coreBaseUrl).href
      });
      return { ffmpeg, fetchFile };
    })().catch((error) => {
      musicConverterPromise = null;
      throw error;
    });
  }

  return musicConverterPromise;
}

async function convertMp4ToMp3(file) {
  const conversionId = ++musicConversionUid;
  const inputName = `music-input-${conversionId}.mp4`;
  const outputName = `music-output-${conversionId}.mp3`;
  const { ffmpeg, fetchFile } = await getMusicConverter();

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    const exitCode = await ffmpeg.exec([
      "-i", inputName,
      "-vn",
      "-codec:a", "libmp3lame",
      "-q:a", "2",
      outputName
    ]);
    if (exitCode !== 0) {
      throw new Error("FFmpeg could not extract an MP3 audio track");
    }
    const data = await ffmpeg.readFile(outputName);
    const displayName = `${file.name.replace(/\.[^.]+$/, "")}.mp3`;
    return new File([data], displayName, { type: "audio/mpeg" });
  } finally {
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});
  }
}

function queueMp4Conversion(file) {
  const conversion = musicConversionQueue.then(() => convertMp4ToMp3(file));
  musicConversionQueue = conversion.catch(() => {});
  return conversion;
}

async function selectMusicMedia(card, file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["mp3", "mp4"].includes(extension)) {
    card.querySelector(".music-media-status").textContent = "Choose an MP3 or MP4 file";
    return;
  }

  clearMusicMedia(card);
  musicSaveStatus.textContent = "";

  if (extension === "mp3") {
    showMusicMedia(card, file);
    return;
  }

  const conversionToken = Symbol("music-conversion");
  musicMediaSelections.set(card, {
    file: null,
    isConverting: true,
    previewUrl: null,
    token: conversionToken
  });
  card.querySelector(".music-media-status").textContent = "Loading the audio converter and creating an MP3…";
  setMusicSaveAvailability();

  try {
    const convertedFile = await queueMp4Conversion(file);
    if (musicMediaSelections.get(card)?.token !== conversionToken) {
      return;
    }
    showMusicMedia(card, convertedFile, true, file);
  } catch (error) {
    if (musicMediaSelections.get(card)?.token !== conversionToken) {
      return;
    }
    musicMediaSelections.delete(card);
    card.querySelector(".music-media-status").textContent = "This MP4 could not be converted. Make sure it contains an audio track";
    setMusicSaveAvailability();
  }
}

function renumberMusicTracks() {
  musicTrackList.querySelectorAll(".music-track-card").forEach((card, index) => {
    card.dataset.trackIndex = String(index + 1);
    card.querySelector(".music-track-heading strong").textContent = `Track ${index + 1}`;
  });
}

function createMusicTrack() {
  musicTrackUid += 1;
  const mediaInputId = `track-media-${musicTrackUid}`;
  const card = document.createElement("article");
  card.className = "music-track-card";
  card.innerHTML = `
    <div class="music-track-heading">
      <strong>Track</strong>
      <button type="button" aria-label="Remove track">Remove track</button>
    </div>
    <div class="music-track-fields">
      <label>
        <span>Song name <b>Required</b></span>
        <input type="text" name="song-name" autocomplete="off" required placeholder="Enter a song name">
      </label>
      <label>
        <span>Author <small>Optional</small></span>
        <input type="text" name="author" autocomplete="off" placeholder="Enter an author">
      </label>
    </div>
    <div class="music-media-control">
      <input class="music-media-input" id="${mediaInputId}" type="file" accept=".mp3,.mp4,audio/mpeg,video/mp4">
      <label class="music-media-dropzone" for="${mediaInputId}">
        <span><strong>Drop MP3 or MP4 here</strong><small>or choose a local file</small></span>
        <b aria-hidden="true">＋</b>
      </label>
      <p class="music-media-note">MP4 audio will be converted to MP3 in this browser</p>
      <p class="music-media-status" role="status" aria-live="polite"></p>
      <div class="music-media-selection" hidden>
        <div><span>Audio ready</span><strong class="music-media-name"></strong></div>
        <div class="music-media-actions">
          <button type="button" data-music-action="remove-media">Remove file</button>
        </div>
        <audio controls controlslist="nodownload noplaybackrate noremoteplayback" disableremoteplayback preload="metadata"></audio>
      </div>
    </div>`;

  card.querySelector("button").addEventListener("click", () => {
    clearMusicMedia(card);
    card.remove();
    renumberMusicTracks();
    musicSaveStatus.textContent = "";
  });

  return card;
}

addMusicTrackButton.addEventListener("click", () => {
  const card = createMusicTrack();
  musicTrackList.append(card);
  renumberMusicTracks();
  musicSaveStatus.textContent = "";
  card.querySelector('input[name="song-name"]').focus();
});

musicTrackList.addEventListener("input", (event) => {
  if (event.target.matches('input[name="song-name"]')) {
    event.target.removeAttribute("aria-invalid");
  }
  musicSaveStatus.textContent = "";
});

musicTrackList.addEventListener("change", (event) => {
  if (!event.target.matches(".music-media-input")) {
    return;
  }
  const file = event.target.files?.[0];
  if (file) {
    selectMusicMedia(event.target.closest(".music-track-card"), file);
  }
});

musicTrackList.addEventListener("dragover", (event) => {
  const dropzone = event.target.closest(".music-media-dropzone");
  if (!dropzone) {
    return;
  }
  event.preventDefault();
  dropzone.classList.add("is-dragging");
});

musicTrackList.addEventListener("dragleave", (event) => {
  const dropzone = event.target.closest(".music-media-dropzone");
  if (dropzone && !dropzone.contains(event.relatedTarget)) {
    dropzone.classList.remove("is-dragging");
  }
});

musicTrackList.addEventListener("drop", (event) => {
  const dropzone = event.target.closest(".music-media-dropzone");
  if (!dropzone) {
    return;
  }
  event.preventDefault();
  dropzone.classList.remove("is-dragging");
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    selectMusicMedia(dropzone.closest(".music-track-card"), file);
  }
});

musicTrackList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-music-action]");
  if (!actionButton) {
    return;
  }

  const card = actionButton.closest(".music-track-card");
  if (actionButton.dataset.musicAction === "remove-media") {
    clearMusicMedia(card);
    musicSaveStatus.textContent = "";
  }
});

musicTrackList.addEventListener("play", (event) => {
  if (!event.target.matches("audio")) {
    return;
  }
  musicTrackList.querySelectorAll("audio").forEach((audio) => {
    if (audio !== event.target) {
      audio.pause();
    }
  });
}, true);

saveMusicTracksButton.addEventListener("click", () => {
  const cards = [...musicTrackList.querySelectorAll(".music-track-card")];
  const missingSongName = cards
    .map((card) => card.querySelector('input[name="song-name"]'))
    .find((input) => !input.value.trim());

  cards.forEach((card) => {
    const songInput = card.querySelector('input[name="song-name"]');
    songInput.setAttribute("aria-invalid", String(!songInput.value.trim()));
  });

  if (missingSongName) {
    musicSaveStatus.textContent = "Add a song name for every track before saving";
    missingSongName.focus();
    return;
  }

  if (cards.some((card) => musicMediaSelections.get(card)?.isConverting)) {
    musicSaveStatus.textContent = "Wait for MP4 conversion to finish before saving";
    return;
  }

  modBuildState.music.tracks = cards.map((card) => {
    const media = musicMediaSelections.get(card);
    return {
      author: card.querySelector('input[name="author"]').value.trim(),
      songName: card.querySelector('input[name="song-name"]').value.trim(),
      media: media ? {
        convertedFromMp4: media.convertedFromMp4,
        file: media.file,
        sourceName: media.sourceName,
        sourceType: media.sourceType
      } : null
    };
  });
  const trackCount = modBuildState.music.tracks.length;
  const trackLabel = trackCount === 1 ? "track" : "tracks";
  updateSavedMusicSummary();
  musicSaveStatus.textContent = `${trackCount} ${trackLabel} saved for this visit`;
});

renderThemeEditor();
renderAppIconEditor();
renderModIconEditor();
renderWallpaperEditor();
renderBrowserSoundsEditor();
renderKeyboardSoundsEditor();
renderSplashEditor();
renderCursorEditor();
ensureDefaultModIcon().catch(() => {});

if (window.location.hash === "#speed-dial-effects-editor") {
  window.history.replaceState(null, "", "#wallpaper-editor");
}

if (["#creator", "#theme-editor", "#app-icon-editor", "#mod-icon-editor", "#wallpaper-editor", "#music-editor", "#browser-sounds-editor", "#keyboard-sounds-editor", "#font-editor", "#splash-editor", "#cursor-editor", "#build-review"].includes(window.location.hash)) {
  landingView.classList.remove("is-active");
  landingView.setAttribute("aria-hidden", "true");
  const initialViews = {
    "#creator": creatorView,
    "#theme-editor": themeEditorView,
    "#app-icon-editor": appIconEditorView,
    "#mod-icon-editor": modIconEditorView,
    "#wallpaper-editor": wallpaperEditorView,
    "#music-editor": musicEditorView,
    "#browser-sounds-editor": browserSoundsEditorView,
    "#keyboard-sounds-editor": keyboardSoundsEditorView,
    "#font-editor": fontEditorView,
    "#splash-editor": splashEditorView,
    "#cursor-editor": cursorEditorView,
    "#build-review": buildReviewView
  };
  let initialView = initialViews[window.location.hash];
  if (initialView === buildReviewView && !hasSavedModOptions()) {
    initialView = creatorView;
    window.history.replaceState(null, "", "#creator");
  }
  initialView.removeAttribute("aria-hidden");
  initialView.classList.add("is-active");
  if (initialView === themeEditorView) {
    applyPageTheme();
  }
  if (initialView === wallpaperEditorView) {
    renderWallpaperEditor();
  }
  if (initialView === appIconEditorView) {
    renderAppIconEditor();
  }
  if (initialView === modIconEditorView) {
    ensureDefaultModIcon().then(renderModIconEditor).catch(() => {});
  }
  if (initialView === buildReviewView) {
    renderBuildSummary();
  }
}
