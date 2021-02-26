import { vec3 } from "gl-matrix";
import { Model_TYPE } from "./Types";
import { MathMap } from "./Utilities";
import GL from "./GL";
import Transform from "./Transform";

export default class Light {
  lightColor: vec3;
  lightPosition: vec3;

  ambientStrength = 0.15;
  diffuseStrength = 0.7;
  specularStrength = 0.15;
  specularShininess = 256.0;

  transform: Transform;

  debugPixel: Model_TYPE;

  constructor(
    gl: GL,
    name = "light",
    position: [number, number, number] = [0, 0, 0],
    color: [number, number, number] = [255, 255, 255]
  ) {
    this.lightColor = vec3.fromValues(...color);
    this.lightPosition = vec3.fromValues(...position);

    this.transform = new Transform();

    this.debugPixel = gl.createVertexArrayObject({
      name: `${name}-debug-pixel`,
      drawMode: gl.POINTS,
      positionArray: [...position],
      normalArray: [0, 0, 0],
      uvArray: [0, 0],
      colorArray: [1, 0, 0, 1],
    });

    this.debugPixel.transform = this.transform;
  }
}

export class RotatingLight extends Light {
  radius = 1.5;

  currentAngle = 0;
  currentHeight = 0;

  rotateSpeed = 0.05;
  verticalSpeed = 0.05;

  constructor(
    gl: GL,
    name = "rotating-light",
    position: [number, number, number] = [0, 0, 0],
    color: [number, number, number] = [255, 255, 255],
    options?: {
      initialAngle: number;
      initialHeight: number;
      rotateSpeed: number;
      verticalSpeed: number;
    }
  ) {
    super(gl, name, position, color);

    if (options) {
      const {
        initialAngle,
        initialHeight,
        rotateSpeed,
        verticalSpeed,
      } = options;

      if (initialAngle) this.currentAngle = initialAngle;
      if (initialHeight) this.currentHeight = initialHeight;
      if (rotateSpeed) this.rotateSpeed = rotateSpeed;
      if (verticalSpeed) this.verticalSpeed = verticalSpeed;
    }
  }

  onRender(speed = 0): void {
    const { radius, rotateSpeed, verticalSpeed } = this;

    this.currentAngle += rotateSpeed * speed;
    this.currentHeight += verticalSpeed * speed;

    const { currentAngle, currentHeight } = this;

    const x = radius * Math.cos(currentAngle);
    const z = radius * Math.sin(currentAngle);
    const y = MathMap(Math.sin(currentHeight), -1, 1, 0, 2);

    this.transform.setTransformation({
      position: [x, y, z],
      isIncremental: false,
    });
  }
}
