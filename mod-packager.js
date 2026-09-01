(function initializeModPackager(globalScope) {
  const textEncoder = new TextEncoder();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createManifest(templateManifest, build) {
    const manifest = clone(templateManifest);
    const templatePayload = templateManifest.mod?.payload || {};
    const payload = {};
    const defaultComponentName = (section) => templatePayload[section]?.[0]?.name || templateManifest.name;

    manifest.mod.payload = payload;

    if (build.appIcon) {
      payload.app_icon = [{
        id: "AppIcon",
        name: defaultComponentName("app_icon"),
        path: "app_icon/classic_GX_logo.png"
      }];
    }

    if (build.music.length) {
      payload.background_music = build.music.map((track, index) => ({
        author: track.author,
        id: `music_${index}`,
        name: track.name,
        tracks: [track.path]
      }));
    }

    if (build.browserSounds) {
      payload.browser_sounds = [{
        id: "BrowserSounds",
        name: defaultComponentName("browser_sounds"),
        sounds: Object.fromEntries(
          build.browserSounds.items.map(({ path, type }) => [type, [path]])
        )
      }];
    }

    if (build.keyboardSounds) {
      const sounds = {};
      build.keyboardSounds.items.forEach(({ path, type }) => {
        if (!sounds[type]) sounds[type] = [];
        sounds[type].push(path);
      });
      payload.keyboard_sounds = [{
        id: "KeyboardSounds",
        name: defaultComponentName("keyboard_sounds"),
        sounds
      }];
    }

    if (build.cursors) {
      payload.cursors = [{
        id: "Cursors",
        items: build.cursors.items.map(({ path, type }) => ({ path, type })),
        name: defaultComponentName("cursors"),
        preview: build.cursors.preview
      }];
    }

    const savedThemeModes = Object.entries(build.theme);
    if (savedThemeModes.length) {
      const theme = { id: "0", name: defaultComponentName("theme") };
      savedThemeModes.forEach(([mode, values]) => {
        theme[mode] = {
          gx_accent: clone(values.accent),
          gx_secondary_base: clone(values.secondary)
        };
      });
      payload.theme = [theme];
    }

    const savedWallpaperModes = Object.entries(build.wallpaper);
    if (savedWallpaperModes.length) {
      const wallpaper = { id: "Wallpaper", name: defaultComponentName("wallpaper") };
      savedWallpaperModes.forEach(([mode, values]) => {
        wallpaper[mode] = clone(values);
      });
      payload.wallpaper = [wallpaper];
    }

    return manifest;
  }

  const crcTable = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    crcTable[index] = value >>> 0;
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function setUint16(view, offset, value) {
    view.setUint16(offset, value, true);
  }

  function setUint32(view, offset, value) {
    view.setUint32(offset, value >>> 0, true);
  }

  function getDosDateTime(date) {
    const year = Math.max(1980, date.getFullYear());
    return {
      date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
    };
  }

  async function toBytes(data) {
    if (typeof data === "string") {
      return textEncoder.encode(data);
    }
    if (data instanceof Uint8Array) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    if (data instanceof Blob) {
      return new Uint8Array(await data.arrayBuffer());
    }
    return new Uint8Array();
  }

  async function createZipBlob(inputEntries) {
    const now = new Date();
    const { date, time } = getDosDateTime(now);
    const preparedEntries = [];

    for (const input of inputEntries) {
      const name = input.path.replace(/\\/g, "/");
      const nameBytes = textEncoder.encode(name);
      const data = await toBytes(input.data);
      preparedEntries.push({
        crc: crc32(data),
        data,
        isDirectory: name.endsWith("/"),
        nameBytes
      });
    }

    const parts = [];
    const centralParts = [];
    let offset = 0;
    let centralSize = 0;

    preparedEntries.forEach((entry) => {
      const local = new Uint8Array(30);
      const localView = new DataView(local.buffer);
      setUint32(localView, 0, 0x04034b50);
      setUint16(localView, 4, 20);
      setUint16(localView, 6, 0x0800);
      setUint16(localView, 8, 0);
      setUint16(localView, 10, time);
      setUint16(localView, 12, date);
      setUint32(localView, 14, entry.crc);
      setUint32(localView, 18, entry.data.length);
      setUint32(localView, 22, entry.data.length);
      setUint16(localView, 26, entry.nameBytes.length);
      setUint16(localView, 28, 0);
      parts.push(local, entry.nameBytes, entry.data);

      const central = new Uint8Array(46);
      const centralView = new DataView(central.buffer);
      setUint32(centralView, 0, 0x02014b50);
      setUint16(centralView, 4, 20);
      setUint16(centralView, 6, 20);
      setUint16(centralView, 8, 0x0800);
      setUint16(centralView, 10, 0);
      setUint16(centralView, 12, time);
      setUint16(centralView, 14, date);
      setUint32(centralView, 16, entry.crc);
      setUint32(centralView, 20, entry.data.length);
      setUint32(centralView, 24, entry.data.length);
      setUint16(centralView, 28, entry.nameBytes.length);
      setUint16(centralView, 30, 0);
      setUint16(centralView, 32, 0);
      setUint16(centralView, 34, 0);
      setUint16(centralView, 36, 0);
      setUint32(centralView, 38, entry.isDirectory ? 0x10 : 0);
      setUint32(centralView, 42, offset);
      centralParts.push(central, entry.nameBytes);

      offset += local.length + entry.nameBytes.length + entry.data.length;
      centralSize += central.length + entry.nameBytes.length;
    });

    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    setUint32(endView, 0, 0x06054b50);
    setUint16(endView, 4, 0);
    setUint16(endView, 6, 0);
    setUint16(endView, 8, preparedEntries.length);
    setUint16(endView, 10, preparedEntries.length);
    setUint32(endView, 12, centralSize);
    setUint32(endView, 16, offset);
    setUint16(endView, 20, 0);

    return new Blob([...parts, ...centralParts, end], { type: "application/zip" });
  }

  globalScope.ModPackager = { createManifest, createZipBlob };
}(globalThis));
