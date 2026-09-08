(function initializeSpeedDialPreview(globalScope) {
  const WIDTH = 960;
  const HEIGHT = 500;
  const TILES = [
    { color: [70, 23, 32], label: "YOUTUBE", x: 105 },
    { color: [97, 38, 170], label: "TWITCH", x: 300 },
    { color: [118, 42, 45], label: "REDDIT", x: 495 },
    { color: [91, 52, 58], label: "DISCORD", x: 690 }
  ].map((tile) => ({ ...tile, y: 205, width: 165, height: 108 }));

  function deleteObject(value) {
    if (value && typeof value.delete === "function") value.delete();
  }

  function createStoreImage(canvasKit) {
    const source = document.createElement("canvas");
    source.width = WIDTH;
    source.height = HEIGHT;
    const context = source.getContext("2d");
    context.fillStyle = "#0b0911";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    const glow = context.createRadialGradient(480, 245, 30, 480, 245, 560);
    glow.addColorStop(0, "rgba(109, 63, 143, 0.28)");
    glow.addColorStop(1, "rgba(7, 6, 10, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.strokeStyle = "rgba(120, 82, 148, 0.13)";
    context.lineWidth = 1;
    for (let x = 0; x <= WIDTH; x += 48) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, HEIGHT);
      context.stroke();
    }
    for (let y = 0; y <= HEIGHT; y += 48) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(WIDTH, y);
      context.stroke();
    }
    context.fillStyle = "#ff1b4d";
    context.font = "800 34px Arial";
    context.fillText("GX", 45, 62);
    context.fillStyle = "#f7f5fb";
    context.fillText(" STORE", 96, 62);
    context.font = "700 12px Arial";
    context.fillStyle = "#aaa4b7";
    context.fillText("SPEED DIAL EFFECT PREVIEW", 47, 91);
    context.strokeStyle = "rgba(255, 27, 77, 0.72)";
    context.strokeRect(46, 126, 868, 244);
    context.fillStyle = "rgba(10, 8, 14, 0.9)";
    context.fillRect(47, 127, 866, 242);
    TILES.forEach((tile, index) => {
      const gradient = context.createLinearGradient(tile.x, tile.y, tile.x + tile.width, tile.y + tile.height);
      const [r, g, b] = tile.color;
      gradient.addColorStop(0, `rgb(${r + 45}, ${g + 20}, ${b + 20})`);
      gradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`);
      context.fillStyle = gradient;
      context.fillRect(tile.x, tile.y, tile.width, tile.height);
      context.fillStyle = "rgba(255,255,255,0.08)";
      context.beginPath();
      context.arc(tile.x + 32 + index * 7, tile.y + 80, 58, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#ffffff";
      context.font = "800 17px Arial";
      context.textAlign = "center";
      context.fillText(tile.label, tile.x + tile.width / 2, tile.y + 63);
    });
    context.textAlign = "left";
    context.fillStyle = "#aaa4b7";
    context.font = "600 13px Arial";
    context.fillText("Hover a tile to play the selected effect", 47, 410);
    context.fillStyle = "#ff1b4d";
    context.fillText("REAL SKSL PREVIEW", 770, 410);
    return canvasKit.MakeImageFromCanvasImageSource(source);
  }

  class SpeedDialPreview {
    constructor(canvas) {
      this.canvas = canvas;
      this.canvasKit = null;
      this.surface = null;
      this.paint = null;
      this.baseImage = null;
      this.baseShader = null;
      this.effect = null;
      this.active = false;
      this.frameId = 0;
      this.lastTime = performance.now();
      this.hoveredTile = -1;
      this.progress = TILES.map(() => 0);
      this.readyPromise = null;
      canvas.addEventListener("pointermove", (event) => this.updatePointer(event));
      canvas.addEventListener("pointerleave", () => { this.hoveredTile = -1; });
    }

    async initialize() {
      if (this.readyPromise) return this.readyPromise;
      this.readyPromise = this.initializeRuntime();
      return this.readyPromise;
    }

    async initializeRuntime() {
      this.canvasKit = await globalScope.GXGetCanvasKit();
      this.surface = this.canvasKit.MakeCanvasSurface(this.canvas);
      if (!this.surface) throw new Error("A WebGL Speed Dial preview could not be created");
      this.paint = new this.canvasKit.Paint();
      this.baseImage = createStoreImage(this.canvasKit);
      if (!this.baseImage) throw new Error("The Speed Dial preview artwork could not be created");
      this.baseShader = this.baseImage.makeShaderOptions(
        this.canvasKit.TileMode.Clamp,
        this.canvasKit.TileMode.Clamp,
        this.canvasKit.FilterMode.Linear,
        this.canvasKit.MipmapMode.None
      );
      this.draw(performance.now());
    }

    updatePointer(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * WIDTH / rect.width;
      const y = (event.clientY - rect.top) * HEIGHT / rect.height;
      this.hoveredTile = TILES.findIndex((tile) => (
        x >= tile.x && x <= tile.x + tile.width && y >= tile.y && y <= tile.y + tile.height
      ));
    }

    setActive(active) {
      this.active = active;
      if (!active) {
        cancelAnimationFrame(this.frameId);
        this.frameId = 0;
        return;
      }
      this.initialize().then(() => {
        this.lastTime = performance.now();
        if (!this.frameId && this.active) this.frameId = requestAnimationFrame((time) => this.animate(time));
      });
    }

    async compile(source) {
      await this.initialize();
      if (!/uniform\s+shader\s+iChunk\s*;/.test(source)) {
        throw new Error("The effect must declare: uniform shader iChunk;");
      }
      if (!/uniform\s+float\s+iArgs\s*\[/.test(source)) {
        throw new Error("The effect must declare the Opera iArgs uniform array");
      }
      let compilationError = "";
      const nextEffect = this.canvasKit.RuntimeEffect.Make(source, (message) => {
        compilationError = message;
      });
      if (!nextEffect) throw new Error(compilationError.trim() || "Speed Dial effect compilation failed");
      deleteObject(this.effect);
      this.effect = nextEffect;
      this.progress.fill(0);
      this.draw(performance.now());
    }

    createUniformValues(hoverFrame) {
      const values = new Float32Array(this.effect.getUniformFloatCount());
      for (let index = 0; index < this.effect.getUniformCount(); index += 1) {
        if (this.effect.getUniformName(index) !== "iArgs") continue;
        const uniform = this.effect.getUniform(index);
        const args = [0, 1, 0.105, 0.302, 0, 0, 0, hoverFrame, 0];
        values.set(args.slice(0, uniform.columns * uniform.rows), uniform.slot);
      }
      return values;
    }

    draw(time) {
      if (!this.surface || !this.baseImage) return;
      const kit = this.canvasKit;
      const canvas = this.surface.getCanvas();
      canvas.clear(kit.TRANSPARENT);
      canvas.drawImage(this.baseImage, 0, 0, this.paint);
      if (this.effect) {
        TILES.forEach((tile, index) => {
          const shader = this.effect.makeShaderWithChildren(this.createUniformValues(this.progress[index]), [this.baseShader]);
          if (!shader) return;
          this.paint.setShader(shader);
          canvas.save();
          canvas.clipRect(kit.LTRBRect(tile.x, tile.y, tile.x + tile.width, tile.y + tile.height), kit.ClipOp.Intersect, true);
          canvas.drawRect(kit.LTRBRect(tile.x, tile.y, tile.x + tile.width, tile.y + tile.height), this.paint);
          canvas.restore();
          this.paint.setShader(null);
          deleteObject(shader);
        });
      }
      this.surface.flush();
    }

    animate(time) {
      this.frameId = 0;
      if (!this.active) return;
      const delta = Math.min(50, time - this.lastTime);
      this.lastTime = time;
      this.progress = this.progress.map((value, index) => {
        const direction = index === this.hoveredTile ? 1 : -1;
        return Math.max(0, Math.min(100, value + direction * delta / 5));
      });
      try {
        this.draw(time);
      } catch (error) {
        globalScope.dispatchEvent(new CustomEvent("gx-speed-dial-preview-error", { detail: error }));
        this.setActive(false);
        return;
      }
      this.frameId = requestAnimationFrame((nextTime) => this.animate(nextTime));
    }
  }

  globalScope.GXSpeedDialPreview = SpeedDialPreview;
})(window);
