import { mat3, mat4, vec3, vec4 } from "gl-matrix";

export default class Transform {
  position: vec3;
  scale: vec3;
  rotation: vec3;

  modelViewMatrix: mat4;
  normalMatrix: mat3;

  forward: vec4;
  up: vec4;
  right: vec4;

  constructor() {
    this.position = vec3.fromValues(0, 0, 0);
    this.scale = vec3.fromValues(1, 1, 1);
    this.rotation = vec3.fromValues(0, 0, 0);

    this.modelViewMatrix = mat4.create();
    this.normalMatrix = mat3.create();

    this.forward = vec4.create();
    this.up = vec4.create();
    this.right = vec4.create();
  }

  static toRadian = (deg: number): number => (deg * Math.PI) / 180;

  setTransformation(options: {
    position?: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
    isIncremental?: boolean;
  }): Transform {
    const { position, scale, rotation, isIncremental = true } = options;
    const {
      position: oldPosition,
      scale: oldScale,
      rotation: oldRotation,
    } = this;

    let newPosition = vec3.create();
    let newScale = vec3.create();
    let newRotation = vec3.create();

    if (position) newPosition = vec3.fromValues(...position);
    if (scale) newScale = vec3.fromValues(...scale);
    if (rotation) newRotation = vec3.fromValues(...rotation);

    if (isIncremental) {
      if (position) vec3.add(newPosition, newPosition, oldPosition);
      if (scale) vec3.add(newScale, newScale, oldScale);
      if (rotation) vec3.add(newRotation, newRotation, oldRotation);
    }

    if (position) this.position = newPosition;
    if (scale) this.scale = newScale;
    if (rotation) this.rotation = newRotation;

    this.updateMatrix();

    return this;
  }

  updateMatrix(): mat4 {
    const { modelViewMatrix, position, scale, rotation } = this;
    const { toRadian } = Transform;

    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, position);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, toRadian(rotation[0]));
    mat4.rotateY(modelViewMatrix, modelViewMatrix, toRadian(rotation[1]));
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, toRadian(rotation[2]));
    mat4.scale(modelViewMatrix, modelViewMatrix, scale);

    this.calculateNormal();
    this.calculateOrientation();

    return modelViewMatrix;
  }

  calculateNormal(): mat3 {
    const { normalMatrix, modelViewMatrix } = this;

    mat3.normalFromMat4(normalMatrix, modelViewMatrix);

    return normalMatrix;
  }

  calculateOrientation(): [vec4, vec4, vec4] {
    const { right, up, forward, modelViewMatrix } = this;

    const newRight = vec4.fromValues(1, 0, 0, 0);
    const newUp = vec4.fromValues(0, 1, 0, 0);
    const newForward = vec4.fromValues(0, 0, 1, 0);

    vec4.transformMat4(right, newRight, modelViewMatrix);
    vec4.transformMat4(up, newUp, modelViewMatrix);
    vec4.transformMat4(forward, newForward, modelViewMatrix);

    return [right, up, forward];
  }
}
