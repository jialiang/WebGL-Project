export default class RenderLoop {
  isActive: boolean;
  onRender: (arg0: number) => void;
  onBeforeRender?: () => void;
  fps: number;

  constructor(onRender: () => void, onBeforeRender?: () => void) {
    this.isActive = false;
    this.onRender = onRender;
    this.onBeforeRender = onBeforeRender;
    this.fps = 0;
  }

  run(previousTime: number): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - previousTime;

    this.fps = Math.floor(1 / deltaTime);
    this.onRender(deltaTime);

    if (this.isActive) requestAnimationFrame(this.run.bind(this));
  }

  start(): RenderLoop {
    if (this.isActive) return this;

    this.isActive = true;

    if (typeof this.onBeforeRender === "function") this.onBeforeRender();

    requestAnimationFrame(this.run.bind(this));
    console.log("Render loop started");

    return this;
  }

  stop(): RenderLoop {
    this.isActive = false;
    console.log("Render loop stopped");
    return this;
  }
}
