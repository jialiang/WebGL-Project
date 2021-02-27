import { vec3 } from "gl-matrix";
import {
  LightOptions_TYPE,
  Model_TYPE,
  RotatingLightOptions_TYPE,
} from "./Types";
import { MathMap } from "./Utilities";
import GL from "./GL";
import Transform from "./Transform";

export default class Light {
  color = vec3.fromValues(1, 1, 1);
  position = vec3.fromValues(0, 0, 0);

  ambientStrength = 0.15;
  diffuseStrength = 0.7;
  specularStrength = 0.15;
  specularShininess = 128.0;

  transform: Transform;

  debugPixel: Model_TYPE;

  constructor(gl: GL, name = "light", options?: LightOptions_TYPE) {
    if (options) {
      const keys = Object.keys(options) as (keyof LightOptions_TYPE)[];

      keys.forEach((key) => {
        const value = options[key];

        if (options[key] == null) return;

        if (key === "position" || key === "color")
          this[key] = vec3.fromValues(
            ...(options[key] as [number, number, number])
          );
        else this[key] = value as number;
      });
    }

    this.transform = new Transform();

    this.debugPixel = gl.createVertexArrayObject({
      name: `${name}-debug-pixel`,
      drawMode: gl.POINTS,
      positionArray: [this.position[0], this.position[1], this.position[2]],
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

    options?: LightOptions_TYPE,
    additionalOptions?: RotatingLightOptions_TYPE
  ) {
    super(gl, name, options);

    if (additionalOptions) {
      const keys = Object.keys(
        additionalOptions
      ) as (keyof RotatingLightOptions_TYPE)[];

      keys.forEach((key) => {
        const value = additionalOptions[key];

        if (additionalOptions[key] == null) return;

        if (key === "initialAngle") this.currentAngle = value as number;
        else if (key === "initialHeight") this.currentHeight = value as number;
        else this[key] = value as number;
      });
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
