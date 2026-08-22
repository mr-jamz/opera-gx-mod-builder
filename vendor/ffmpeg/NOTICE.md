# ffmpeg.wasm browser runtime

This directory contains pinned browser runtime files from the ffmpeg.wasm project:

- `@ffmpeg/ffmpeg` 0.12.15 (MIT)
- `@ffmpeg/util` 0.12.2 (MIT)
- `@ffmpeg/core` 0.12.10 (GPL-2.0-or-later)

Project source: https://github.com/ffmpegwasm/ffmpeg.wasm

These files are self-hosted because the ffmpeg.wasm installation documentation does not support importing the worker package directly from a CDN. The runtime is loaded only when an MP4 track needs to be converted to MP3.
