import GL from "./GL";

export default class RenderLoop {
  canvas: HTMLCanvasElement;
  isActive: boolean;
  fpsCounter: HTMLDivElement;
  fps: string;

  onRender: (speed: number) => void;
  onBeforeRender?: () => void;

  constructor(gl: GL, onRender: () => void, onBeforeRender?: () => void) {
    this.canvas = gl.canvas as HTMLCanvasElement;
    this.isActive = false;
    this.fps = "0.00";

    this.onRender = onRender;
    this.onBeforeRender = onBeforeRender;

    const fpsCounter = document.createElement("div");

    fpsCounter.className = "fps-counter";
    document.body.appendChild(fpsCounter);

    this.fpsCounter = fpsCounter;
  }

  run(previousTime: number): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - previousTime;
    const animationSpeedFactor = deltaTime / (1000 / 60);

    if (deltaTime !== 0) {
      const fps = 1000 / deltaTime;
      if (fps < 1000) this.fps = fps.toFixed(2);
    }

    this.onRender(animationSpeedFactor);

    if (this.isActive) {
      requestAnimationFrame(() => {
        this.run(currentTime);
      });
    }
  }

  reportFps(): void {
    this.fpsCounter.innerHTML = this.fps;

    if (this.isActive) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          this.reportFps();
        });
      }, 250);
    }
  }

  start(): RenderLoop {
    if (this.isActive) return this;

    this.isActive = true;

    if (typeof this.onBeforeRender === "function") this.onBeforeRender();

    requestAnimationFrame(() => {
      this.run(performance.now());
      this.reportFps();
    });
    console.log("Render loop started");

    return this;
  }

  stop(): RenderLoop {
    this.isActive = false;
    console.log("Render loop stopped");
    return this;
  }
}
