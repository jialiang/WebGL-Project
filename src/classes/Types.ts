import { mat4, mat3 } from "gl-matrix";
import Transform from "./Transform";

export type UniformListItem_TYPE = {
  name: string;
  value: number[] | mat4 | mat3;
  type:
    | "uniform1f"
    | "uniform1i"
    | "uniform2f"
    | "uniform2i"
    | "uniform3f"
    | "uniform3i"
    | "uniform4f"
    | "uniform4i"
    | "uniformMatrix2fv"
    | "uniformMatrix3fv"
    | "uniformMatrix4fv"
    | "uniform1fv"
    | "uniform2fv"
    | "uniform3fv"
    | "uniform4fv";
};

export type VaoOptions_TYPE = {
  name: string;
  drawMode: GLenum;
  positionArray: number[];
  normalArray: number[];
  uvArray: number[];
  colorArray: number[];

  indexArray?: number[];
};

export type Model_TYPE = {
  name: string;
  drawMode: GLenum;
  vao: WebGLVertexArrayObject;

  indexCount: number;
  vertexCount: number;

  positionBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  colorBuffer: WebGLBuffer;

  indexBuffer: WebGLBuffer;

  transform: Transform;
  textures: (WebGLTexture | null)[];
};

export type LightOptions_TYPE = {
  color?: [number, number, number];
  position?: [number, number, number];
  ambientStrength?: number;
  diffuseStrength?: number;
  specularStrength?: number;
  specularShininess?: number;
};

export type RotatingLightOptions_TYPE = {
  initialAngle?: number;
  initialHeight?: number;
  rotateSpeed?: number;
  verticalSpeed?: number;
};

export type ImageDictionary_TYPE = {
  name: string;
  type: "image" | "video";
  url: string;
};

export class XY {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  do(operation: "+" | "-" | "*" | "/", b: XY): XY {
    const { x, y } = this;

    switch (operation) {
      case "+":
        return new XY(x + b.x, y + b.y);
      case "-":
        return new XY(x - b.x, y - b.y);
      case "*":
        return new XY(x * b.x, y * b.y);
      case "/":
        return new XY(x / b.x, y / b.y);
      default:
        return new XY();
    }
  }
}
