const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const wallpaperDir = path.resolve("ModTemplate2.0", "wallpaper");
const jobs = [
  {
    input: "dark_logo_animated.webm",
    output: "opera-gx-logo-static-dark-1920x1080.png"
  },
  {
    input: "light_logo_animated.webm",
    output: "opera-gx-logo-static-light-1920x1080.png"
  }
];

async function extractFrame(page, inputPath, outputPath) {
  const videoData = fs.readFileSync(inputPath).toString("base64");
  const pngData = await page.evaluate(async (data) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = `data:video/webm;base64,${data}`;

    await new Promise((resolve, reject) => {
      video.addEventListener("loadedmetadata", resolve, { once: true });
      video.addEventListener("error", () => reject(video.error), { once: true });
    });

    video.currentTime = Math.min(2.5, Math.max(0, video.duration - 0.1));
    await new Promise((resolve) => video.addEventListener("seeked", resolve, { once: true }));

    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png").split(",")[1];
  }, videoData);

  fs.writeFileSync(outputPath, Buffer.from(pngData, "base64"));
}

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    for (const job of jobs) {
      const inputPath = path.join(wallpaperDir, job.input);
      const outputPath = path.join(wallpaperDir, job.output);
      await extractFrame(page, inputPath, outputPath);
      process.stdout.write(`${outputPath}\n`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
