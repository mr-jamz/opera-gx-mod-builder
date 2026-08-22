const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const isLight = process.argv.includes("--light");
const isMobile = process.argv.includes("--mobile");
const videoWidth = isMobile ? 1440 : 1920;
const videoHeight = isMobile ? 1440 : 1080;
const durationMs = 10020;
const outputName = isMobile
  ? `${isLight ? "light" : "dark"}_logo_animated_mobile.mp4`
  : isLight
    ? "light_logo_animated.webm"
    : "dark_logo_animated.webm";
const outputPath = path.resolve("assets", outputName);

async function main() {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: videoWidth, height: videoHeight } });

  await page.setContent(`
    <!doctype html>
    <html>
      <body style="margin:0;overflow:hidden;background:${isLight ? "#f5f2f7" : "#06060b"}">
        <canvas id="stage" width="${videoWidth}" height="${videoHeight}"></canvas>
      </body>
    </html>
  `);

  const recording = await page.evaluate(async ({ isLightTheme, mobileFormat, recordingDuration }) => {
    const canvas = document.querySelector("#stage");
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const duration = recordingDuration;
    const stream = canvas.captureStream(30);
    const mimeTypes = mobileFormat
      ? ["video/mp4;codecs=avc1.42E01E", "video/mp4"]
      : ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 10000000
    });
    const chunks = [];

    function drawBackground(time) {
      ctx.fillStyle = isLightTheme ? "#f5f2f7" : "#06060b";
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, 760);
      glow.addColorStop(0, isLightTheme ? "rgba(255, 24, 77, 0.09)" : "rgba(255, 24, 77, 0.14)");
      glow.addColorStop(0.42, isLightTheme ? "rgba(122, 83, 137, 0.07)" : "rgba(116, 16, 71, 0.07)");
      glow.addColorStop(1, isLightTheme ? "rgba(245, 242, 247, 0)" : "rgba(6, 6, 11, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalAlpha = isLightTheme ? 0.045 : 0.065;
      ctx.strokeStyle = isLightTheme ? "#69354f" : "#ff2859";
      ctx.lineWidth = 1;
      const offset = (time * 16) % 80;
      for (let x = -80 + offset; x < width + 80; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = -80 + offset; y < height + 80; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      const vignette = ctx.createRadialGradient(width / 2, height / 2, 330, width / 2, height / 2, 1040);
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, isLightTheme ? "rgba(48, 28, 56, 0.14)" : "rgba(0, 0, 0, 0.76)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    }

    function drawLogo(time) {
      const turn = time * Math.PI * 0.4;
      const scaleX = 0.13 + 0.87 * Math.abs(Math.cos(turn));
      const face = Math.cos(turn) >= 0 ? 1 : -1;
      const bob = Math.sin(time * Math.PI * 0.4) * 10;

      ctx.save();
      ctx.translate(width / 2, height / 2 + bob);
      ctx.rotate(Math.sin(time * Math.PI * 0.2) * 0.08);
      ctx.scale(scaleX * face, 1);

      ctx.shadowColor = "rgba(255, 22, 77, 0.9)";
      ctx.shadowBlur = 44;
      ctx.lineCap = "round";

      const ringGradient = ctx.createLinearGradient(-260, -250, 280, 260);
      ringGradient.addColorStop(0, "#ff4b77");
      ringGradient.addColorStop(0.48, "#ff164d");
      ringGradient.addColorStop(1, "#9d0748");

      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = 58;
      ctx.beginPath();
      ctx.ellipse(0, 0, 228, 292, 0, -Math.PI * 0.42, Math.PI * 1.38);
      ctx.stroke();

      ctx.shadowBlur = 20;
      ctx.strokeStyle = "rgba(255, 113, 148, 0.95)";
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.ellipse(-8, 0, 150, 232, 0, Math.PI * 0.57, Math.PI * 1.47);
      ctx.stroke();

      ctx.strokeStyle = "rgba(121, 0, 55, 0.95)";
      ctx.lineWidth = 34;
      ctx.beginPath();
      ctx.ellipse(18, 0, 170, 245, 0, -Math.PI * 0.43, Math.PI * 0.43);
      ctx.stroke();

      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = "#ff6f96";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(-15, -5, 250, 314, 0, -Math.PI * 0.28, Math.PI * 0.84);
      ctx.stroke();
      ctx.restore();
    }

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size) chunks.push(event.data);
    });

    const stopped = new Promise((resolve) => recorder.addEventListener("stop", resolve, { once: true }));
    drawBackground(0);
    drawLogo(0);
    recorder.start(1000);
    const startedAt = performance.now();

    await new Promise((resolve) => {
      function frame(now) {
        const elapsed = now - startedAt;
        const progress = Math.min(elapsed / duration, 1);
        const seconds = progress * 10;
        drawBackground(seconds);
        drawLogo(seconds);
        if (elapsed < duration) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });

    recorder.stop();
    await stopped;
    stream.getTracks().forEach((track) => track.stop());
    const blob = new Blob(chunks, { type: mimeType });
    const preview = document.createElement("video");
    const previewUrl = URL.createObjectURL(blob);
    preview.src = previewUrl;
    await new Promise((resolve, reject) => {
      preview.addEventListener("loadedmetadata", resolve, { once: true });
      preview.addEventListener("error", () => reject(new Error("Video metadata failed to load")), { once: true });
    });

    let videoDuration = preview.duration;
    if (!Number.isFinite(videoDuration)) {
      preview.currentTime = 1e101;
      await new Promise((resolve) => preview.addEventListener("timeupdate", resolve, { once: true }));
      videoDuration = preview.duration;
    }

    const result = {
      bytes: Array.from(new Uint8Array(await blob.arrayBuffer())),
      duration: videoDuration,
      width: preview.videoWidth,
      height: preview.videoHeight,
      mimeType
    };
    URL.revokeObjectURL(previewUrl);
    return result;
  }, {
    isLightTheme: isLight,
    mobileFormat: isMobile,
    recordingDuration: durationMs
  });

  fs.writeFileSync(outputPath, Buffer.from(recording.bytes));

  await browser.close();
  console.log(JSON.stringify({
    outputPath,
    bytes: recording.bytes.length,
    duration: recording.duration,
    width: recording.width,
    height: recording.height,
    mimeType: recording.mimeType
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
