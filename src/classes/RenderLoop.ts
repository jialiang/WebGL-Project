export default class RenderLoop {
  isActive: boolean;
  onRender: (speed: number) => void;
  onBeforeRender?: () => void;

  constructor(onRender: () => void, onBeforeRender?: () => void) {
    this.isActive = false;
    this.onRender = onRender;
    this.onBeforeRender = onBeforeRender;
  }

  run(previousTime: number): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - previousTime;
    const animationSpeedFactor = deltaTime / (1000 / 60);

    this.onRender(animationSpeedFactor);

    if (this.isActive)
      requestAnimationFrame(() => {
        this.run(currentTime);
      });
  }

  start(): RenderLoop {
    if (this.isActive) return this;

    this.isActive = true;

    if (typeof this.onBeforeRender === "function") this.onBeforeRender();

    requestAnimationFrame(() => {
      this.run(performance.now());
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
