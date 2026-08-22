const landingView = document.querySelector("#home");
const creatorView = document.querySelector("#creator");
const themeEditorView = document.querySelector("#theme-editor");
const wallpaperEditorView = document.querySelector("#wallpaper-editor");
const musicEditorView = document.querySelector("#music-editor");
const buildReviewView = document.querySelector("#build-review");
const brandHomeLink = document.querySelector(".brand");
const startButton = document.querySelector("#start-modding");
const backButton = document.querySelector("#back-home");
const backCreatorButton = document.querySelector("#back-creator");
const backWallpaperButton = document.querySelector("#back-wallpaper");
const backMusicButton = document.querySelector("#back-music");
const backBuildReviewButton = document.querySelector("#back-build-review");
const createModButton = document.querySelector("#create-mod");
const buildSummaryGroups = document.querySelector("#build-summary-groups");
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

const modBuildState = {
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
  renderBuildSummary();
  switchView(creatorView, buildReviewView);
  window.history.replaceState(null, "", "#build-review");
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

    if (button.dataset.category === "Music editor") {
      switchView(creatorView, musicEditorView);
      window.history.replaceState(null, "", "#music-editor");
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

backMusicButton.addEventListener("click", () => {
  switchView(musicEditorView, creatorView);
  window.history.replaceState(null, "", "#creator");
});

backBuildReviewButton.addEventListener("click", () => {
  switchView(buildReviewView, creatorView);
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
const savedWallpaperBox = document.querySelector("#saved-wallpaper-box");
const wallpaperCategoryCard = document.querySelector('[data-category="Wallpaper editor"]');

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
  wallpaperPreview.dataset.mode = activeWallpaperMode;
  wallpaperPreview.style.setProperty("--speed-accent", hslString(values.accent));
  wallpaperPreview.style.setProperty("--speed-secondary-h", values.secondary.h);
  wallpaperPreview.style.setProperty("--speed-secondary-s", `${values.secondary.s}%`);
  wallpaperPreviewMode.textContent = modeLabel;
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
    ? "Sample animated wallpaper ready for preview."
    : "Sample static wallpaper ready for preview.";
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
  const hasSavedTheme = Object.values(savedThemeValues).some(Boolean);
  const hasSavedWallpaper = Object.values(savedWallpaperSelections).some(Boolean);
  const hasSavedMusic = modBuildState.music.tracks.length > 0;
  return hasSavedTheme || hasSavedWallpaper || hasSavedMusic;
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
    entry.append(entryTitle, details);
    list.append(entry);
  });

  group.append(heading, list);
  buildSummaryGroups.append(group);
}

function renderBuildSummary() {
  buildSummaryGroups.replaceChildren();

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
    .map(([mode, selection]) => ({
      title: `${mode[0].toUpperCase() + mode.slice(1)} mode`,
      details: [
        { label: "Type", value: selection.kind === "video" ? "Animated" : "Static" },
        { label: "File", value: selection.name },
        { label: "Source", value: selection.source === "included" ? "Sample desktop wallpaper" : "Local upload" }
      ]
    }));
  appendBuildSummaryGroup("Wallpaper", "Saved desktop wallpaper choices", wallpaperItems);

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
    return { title: `Track ${index + 1}`, details };
  });
  appendBuildSummaryGroup("Music", "Saved background music tracks", musicItems);
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
    ? "MP4 audio converted to MP3 and ready to preview."
    : "MP3 ready to preview.";
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
      throw new Error("FFmpeg could not extract an MP3 audio track.");
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
    card.querySelector(".music-media-status").textContent = "Choose an MP3 or MP4 file.";
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
    card.querySelector(".music-media-status").textContent = "This MP4 could not be converted. Make sure it contains an audio track.";
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
      <p class="music-media-note">MP4 audio will be converted to MP3 in this browser.</p>
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
    musicSaveStatus.textContent = "Add a song name for every track before saving.";
    missingSongName.focus();
    return;
  }

  if (cards.some((card) => musicMediaSelections.get(card)?.isConverting)) {
    musicSaveStatus.textContent = "Wait for MP4 conversion to finish before saving.";
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
  musicSaveStatus.textContent = `${trackCount} ${trackLabel} saved for this visit.`;
});

renderThemeEditor();
renderWallpaperEditor();

if (["#creator", "#theme-editor", "#wallpaper-editor", "#music-editor", "#build-review"].includes(window.location.hash)) {
  landingView.classList.remove("is-active");
  landingView.setAttribute("aria-hidden", "true");
  const initialViews = {
    "#creator": creatorView,
    "#theme-editor": themeEditorView,
    "#wallpaper-editor": wallpaperEditorView,
    "#music-editor": musicEditorView,
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
  if (initialView === buildReviewView) {
    renderBuildSummary();
  }
}
