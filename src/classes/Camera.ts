import { mat4 } from "gl-matrix";
import GL from "./GL";
import Transform from "./Transform";
import { XY } from "./Types";

class CameraTransform extends Transform {
  mode: "free" | "orbit";
  viewMatrix: mat4;

  constructor(mode: "free" | "orbit" = "orbit") {
    super();

    this.mode = mode;
    this.viewMatrix = mat4.create();
  }

  panXYZ(x = 0, y = 0, z = 0) {
    const { mode, right, up, forward } = this;

    let newX = 0;
    let newY = 0;
    let newZ = 0;

    // panX
    if (mode !== "orbit") {
      newX += right[0] * x;
      newY += right[1] * x;
      newZ += right[2] * x;
    }

    // panY
    newY += up[1] * y;

    if (mode !== "orbit") {
      newX += up[0] * y;
      newZ += up[2] * y;
    }

    // panZ
    if (mode === "orbit") {
      newZ = z;
    } else {
      newZ += forward[0] * z;
      newZ += forward[1] * z;
      newZ += forward[2] * z;
    }

    return this.setTransformation({
      position: [newX, newY, newZ],
    });
  }

  updateMatrix(): mat4 {
    const { mode, modelViewMatrix, viewMatrix, position, rotation } = this;
    const { toRadian } = CameraTransform;

    // Order important!
    switch (mode) {
      case "orbit":
        mat4.identity(modelViewMatrix);
        mat4.rotateY(modelViewMatrix, modelViewMatrix, toRadian(rotation[1]));
        mat4.rotateX(modelViewMatrix, modelViewMatrix, toRadian(rotation[0]));
        mat4.translate(modelViewMatrix, modelViewMatrix, position);
        break;
      case "free":
        mat4.identity(modelViewMatrix);
        mat4.translate(modelViewMatrix, modelViewMatrix, position);
        mat4.rotateY(modelViewMatrix, modelViewMatrix, toRadian(rotation[1]));
        mat4.rotateX(modelViewMatrix, modelViewMatrix, toRadian(rotation[0]));
        break;
      default:
        break;
    }

    this.calculateOrientation();
    this.calculateViewMatrix();

    return viewMatrix;
  }

  calculateViewMatrix(): mat4 {
    const { viewMatrix, modelViewMatrix } = this;

    mat4.invert(viewMatrix, modelViewMatrix);

    return viewMatrix;
  }
}

export class Camera {
  projectionMatrix: mat4;
  mode: "free" | "orbit";

  transform: CameraTransform;

  constructor(
    gl: GL,
    fov = 45,
    near = 0.1,
    far = 100.0,
    mode: "free" | "orbit" = "orbit"
  ) {
    console.log("Creating camera...");

    const aspectRatio = gl.canvas.width / gl.canvas.height;

    this.projectionMatrix = mat4.create();
    this.transform = new CameraTransform(mode);
    this.mode = mode;

    mat4.perspective(this.projectionMatrix, fov, aspectRatio, near, far);
  }
}

export class CameraController {
  canvas: HTMLCanvasElement;
  camera: Camera;

  rotateRate = 300;
  panRate = 5;
  zoomRate = 200;

  effectiveRotateRate: XY;
  effectivePanRate: XY;
  effectiveZoomRate: number;

  rotateOn: boolean;

  offset: XY;
  initialPosition: XY;
  previousPosition: XY;

  constructor(gl: GL, camera: Camera) {
    console.log("Binding functions to mouse/touch events...");

    this.canvas = gl.canvas as HTMLCanvasElement;
    this.camera = camera;

    const boundingBox = this.canvas.getBoundingClientRect();

    this.offset = new XY(boundingBox.left, boundingBox.top);
    this.initialPosition = new XY();
    this.previousPosition = new XY();

    this.effectiveRotateRate = new XY(
      this.rotateRate / this.canvas.width,
      this.rotateRate / this.canvas.height
    );
    this.effectivePanRate = new XY(
      this.panRate / this.canvas.width,
      this.panRate / this.canvas.height
    );
    this.effectiveZoomRate = this.zoomRate / this.canvas.height;

    this.rotateOn = false;

    this.canvas.onmousedown = (e) => this.handleMouseDown(e);
    this.canvas.onmouseup = () => this.handleMouseUp();
    this.canvas.onwheel = (e) => this.handleMouseWheel(e);
  }

  handleMouseDown(e: MouseEvent): void {
    const { pageX, pageY, button } = e;
    const { offset } = this;

    const position = new XY(pageX, pageY).do("-", offset);

    this.initialPosition = position;
    this.previousPosition = position;

    if (button === 1) {
      this.rotateOn = true;
    }

    this.canvas.onmousemove = (e) => this.handleMouseMove(e);
  }

  handleMouseUp(): void {
    this.canvas.onmousemove = null;
    this.rotateOn = false;
  }

  handleMouseWheel(e: WheelEvent): void {
    const { camera, effectiveZoomRate } = this;
    const { deltaY } = e;

    const clampedDelta = Math.max(-1, Math.min(1, deltaY));
    const normalizedDelta = clampedDelta * effectiveZoomRate;

    camera.transform.panXYZ(0, 0, normalizedDelta);
  }

  handleMouseMove(e: MouseEvent): void {
    const { pageX, pageY, shiftKey } = e;
    const {
      offset,
      previousPosition,
      camera,
      effectiveRotateRate,
      effectivePanRate,
      rotateOn,
    } = this;

    const currentPosition = new XY(pageX, pageY).do("-", offset);
    const delta = currentPosition.do("-", previousPosition);

    if (shiftKey || rotateOn) {
      camera.transform.setTransformation({
        rotation: [
          -delta.y * effectiveRotateRate.y,
          -delta.x * effectiveRotateRate.x,
          0,
        ],
      });
    } else {
      camera.transform.panXYZ(
        -delta.x * effectivePanRate.x,
        delta.y * effectivePanRate.y,
        0
      );
    }

    this.previousPosition = currentPosition;
  }
}

export default {
  Camera,
  CameraController,
};
