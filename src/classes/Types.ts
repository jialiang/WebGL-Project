import { mat4, mat3 } from "gl-matrix";
import Transform from "./Transform";

export type UniformList_TYPE = {
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
    | "uniformMatrix4fv";
};

export type VaoOptions_TYPE = {
  name: string;
  drawMode: GLenum;
  positionArray: number[];

  normalArray?: number[];
  uvArray?: number[];
  colorArray?: number[];
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

  transformation: Transform;
};