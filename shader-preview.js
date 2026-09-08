(function initializeShaderPreview(globalScope) {
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 500;
  const BACKGROUND_URLS = {
    dark: "media/shader-preview-dark.png",
    light: "media/shader-preview-light.png"
  };

  function deleteObject(value) {
    if (value && typeof value.delete === "function") value.delete();
  }

  class ShaderPreview {
    constructor(canvas) {
      this.canvas = canvas;
      this.mode = "dark";
      this.active = false;
      this.canvasKit = null;
      this.surface = null;
      this.paint = null;
      this.effect = null;
      this.images = new Map();
      this.backgroundShaders = new Map();
      this.frameId = 0;
      this.startedAt = performance.now();
      this.readyPromise = null;
    }

    async initialize() {
      if (this.readyPromise) return this.readyPromise;
      this.readyPromise = this.initializeRuntime();
      return this.readyPromise;
    }

    async initializeRuntime() {
      if (typeof globalScope.CanvasKitInit !== "function") {
        throw new Error("The local Skia preview runtime is unavailable");
      }
      this.canvasKit = await globalScope.CanvasKitInit({
        locateFile: (file) => `vendor/canvaskit/${file}`
      });
      if (!this.canvasKit.rt_effect) {
        throw new Error("This Skia build does not include RuntimeEffect support");
      }
      this.surface = this.canvasKit.MakeCanvasSurface(this.canvas);
      if (!this.surface) throw new Error("A WebGL preview surface could not be created");
      this.paint = new this.canvasKit.Paint();
      await Promise.all(Object.entries(BACKGROUND_URLS).map(async ([mode, url]) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`The ${mode} preview background could not be loaded`);
        const image = this.canvasKit.MakeImageFromEncoded(await response.arrayBuffer());
        if (!image) throw new Error(`The ${mode} preview background could not be decoded`);
        this.images.set(mode, image);
        this.backgroundShaders.set(mode, image.makeShaderOptions(
          this.canvasKit.TileMode.Clamp,
          this.canvasKit.TileMode.Clamp,
          this.canvasKit.FilterMode.Linear,
          this.canvasKit.MipmapMode.None,
          this.canvasKit.Matrix.scaled(CANVAS_WIDTH / image.width(), CANVAS_HEIGHT / image.height())
        ));
      }));
      this.draw(performance.now());
    }

    setActive(active) {
      this.active = active;
      if (!active) {
        cancelAnimationFrame(this.frameId);
        this.frameId = 0;
        return;
      }
      this.initialize().then(() => {
        if (!this.frameId && this.active) this.frameId = requestAnimationFrame((time) => this.animate(time));
      });
    }

    setMode(mode) {
      if (!BACKGROUND_URLS[mode]) return;
      this.mode = mode;
      if (this.canvasKit) this.draw(performance.now());
    }

    async compile(source) {
      await this.initialize();
      if (!/uniform\s+shader\s+iChunk\s*;/.test(source)) {
        throw new Error("The shader must declare: uniform shader iChunk;");
      }
      let compilationError = "";
      const nextEffect = this.canvasKit.RuntimeEffect.Make(source, (message) => {
        compilationError = message;
      });
      if (!nextEffect) {
        throw new Error(compilationError.trim() || "SkSL compilation failed");
      }
      deleteObject(this.effect);
      this.effect = nextEffect;
      this.startedAt = performance.now();
      this.draw(this.startedAt);
      return true;
    }

    clearShader() {
      deleteObject(this.effect);
      this.effect = null;
      if (this.canvasKit) this.draw(performance.now());
    }

    createUniformValues(time) {
      const values = new Float32Array(this.effect.getUniformFloatCount());
      const now = new Date();
      const elapsedSeconds = Math.max(0, (time - this.startedAt) / 1000);
      const knownValues = {
        iVisibleRect: [0, 0, CANVAS_WIDTH, CANVAS_HEIGHT],
        iChunkRect: [0, 0, CANVAS_WIDTH, CANVAS_HEIGHT],
        iDate: [now.getFullYear(), now.getMonth() + 1, now.getDate(), elapsedSeconds],
        iMouse: [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2],
        iArgs: new Array(8).fill(0)
      };
      for (let index = 0; index < this.effect.getUniformCount(); index += 1) {
        const name = this.effect.getUniformName(index);
        const uniform = this.effect.getUniform(index);
        const sourceValues = knownValues[name];
        if (!sourceValues) continue;
        values.set(sourceValues.slice(0, uniform.columns * uniform.rows), uniform.slot);
      }
      return values;
    }

    draw(time) {
      if (!this.surface || !this.paint) return;
      const kit = this.canvasKit;
      const canvas = this.surface.getCanvas();
      const image = this.images.get(this.mode);
      const backgroundShader = this.backgroundShaders.get(this.mode);
      canvas.clear(kit.TRANSPARENT);
      if (!this.effect) {
        canvas.drawImageRectOptions(
          image,
          kit.LTRBRect(0, 0, image.width(), image.height()),
          kit.LTRBRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT),
          kit.FilterMode.Linear,
          kit.MipmapMode.None,
          this.paint
        );
      } else {
        const shader = this.effect.makeShaderWithChildren(this.createUniformValues(time), [backgroundShader]);
        if (!shader) throw new Error("The compiled shader could not be rendered");
        this.paint.setShader(shader);
        canvas.drawRect(kit.LTRBRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT), this.paint);
        this.paint.setShader(null);
        deleteObject(shader);
      }
      this.surface.flush();
    }

    animate(time) {
      this.frameId = 0;
      if (!this.active) return;
      try {
        this.draw(time);
      } catch (error) {
        globalScope.dispatchEvent(new CustomEvent("gx-shader-preview-error", { detail: error }));
        this.setActive(false);
        return;
      }
      this.frameId = requestAnimationFrame((nextTime) => this.animate(nextTime));
    }
  }

  globalScope.GXShaderPreview = ShaderPreview;
})(window);
