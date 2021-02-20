import { mat3, mat4, vec3, vec4, glMatrix } from "gl-matrix";

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

  setTransformation(options: {
    position?: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
    isIncremental?: boolean;
  }): Transform {
    const { position, scale, rotation, isIncremental = true } = options;

    let newPosition = vec3.create();
    let newScale = vec3.create();
    let newRotation = vec3.create();

    if (position) newPosition = vec3.fromValues(...position);
    if (scale) newScale = vec3.fromValues(...scale);
    if (rotation) newRotation = vec3.fromValues(...rotation);

    if (isIncremental) {
      if (position) vec3.add(newPosition, newPosition, this.position);
      if (scale) vec3.add(newScale, newScale, this.scale);
      if (rotation) vec3.add(newRotation, newRotation, this.rotation);
    }

    if (position) this.position = newPosition;
    if (scale) this.scale = newScale;
    if (rotation) this.rotation = newRotation;

    this.updateMatrix();

    return this;
  }

  updateMatrix(): mat4 {
    mat4.identity(this.modelViewMatrix);
    mat4.translate(this.modelViewMatrix, this.modelViewMatrix, this.position);
    mat4.rotateX(
      this.modelViewMatrix,
      this.modelViewMatrix,
      glMatrix.toRadian(this.rotation[0])
    );
    mat4.rotateY(
      this.modelViewMatrix,
      this.modelViewMatrix,
      glMatrix.toRadian(this.rotation[1])
    );
    mat4.rotateZ(
      this.modelViewMatrix,
      this.modelViewMatrix,
      glMatrix.toRadian(this.rotation[2])
    );
    mat4.scale(this.modelViewMatrix, this.modelViewMatrix, this.scale);

    this.calculateNormal();
    this.calculateOrientation();

    return this.modelViewMatrix;
  }

  calculateNormal(): mat3 {
    mat3.normalFromMat4(this.normalMatrix, this.modelViewMatrix);
    return this.normalMatrix;
  }

  calculateOrientation(): [vec4, vec4, vec4] {
    this.right = vec4.fromValues(1, 0, 0, 0);
    vec4.transformMat4(this.right, this.right, this.modelViewMatrix);

    this.up = vec4.fromValues(0, 1, 0, 0);
    vec4.transformMat4(this.up, this.up, this.modelViewMatrix);

    this.forward = vec4.fromValues(0, 0, 1, 0);
    vec4.transformMat4(this.forward, this.forward, this.modelViewMatrix);

    return [this.right, this.up, this.forward];
  }
}
