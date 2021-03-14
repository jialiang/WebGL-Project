import { Camera } from "./Camera";
import GL from "./GL";
import { UniformListItem_TYPE } from "./Types";

export default class UniformBufferObject {
  static INDEX = 1;

  gl: GL;
  uniformBuffer: WebGLBuffer;
  blockName: string;
  blockSize: number;
  bindingPoint: number;
  blockVariableInfo: Record<string, { index: number; offset: number }>;

  constructor(
    gl: GL,
    programs: WebGLProgram[],
    blockName: string,
    blockVariableNames?: string[]
  ) {
    console.log(`Creating Uniform Buffer Object ${blockName}...`);

    this.gl = gl;

    const blockIndex = gl.getUniformBlockIndex(programs[0], blockName);
    const blockSize = gl.getActiveUniformBlockParameter(
      programs[0],
      blockIndex,
      gl.UNIFORM_BLOCK_DATA_SIZE
    );

    const uniformBuffer = gl.createBuffer();

    if (!uniformBuffer) {
      throw `Error intializing WebGL2 buffer`;
    }

    gl.bindBuffer(gl.UNIFORM_BUFFER, uniformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    const bindingPoint = UniformBufferObject.INDEX;
    UniformBufferObject.INDEX += 1;

    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, uniformBuffer);

    if (!blockVariableNames || blockVariableNames.length === 0) {
      console.log(
        `Attempting to get default variable names of uniform block ${blockName}...`
      );

      blockVariableNames = this.getDefaultBlockVariableNames();

      if (blockVariableNames.length === 0) {
        throw `Missing block variable names array for uniform block ${blockName}`;
      }
    }

    const blockVariableIndices = gl.getUniformIndices(
      programs[0],
      blockVariableNames
    );

    if (!blockVariableIndices) {
      throw `Error getting indices of variables in uniform block ${blockName}`;
    }

    const blockVariableOffsets = gl.getActiveUniforms(
      programs[0],
      blockVariableIndices,
      gl.UNIFORM_OFFSET
    );

    if (!blockVariableOffsets) {
      throw `Error getting offsets of variables in uniform block ${blockName}`;
    }

    const blockVariableIndicesArray = Array.from(blockVariableIndices);
    const blockVariableOffsetsArray = Array.from(blockVariableOffsets);

    this.blockVariableInfo = {};

    blockVariableNames.forEach((name, index) => {
      this.blockVariableInfo[name] = {
        index: blockVariableIndicesArray[index] as number,
        offset: blockVariableOffsetsArray[index] as number,
      };
    });

    this.uniformBuffer = uniformBuffer;
    this.blockName = blockName;
    this.blockSize = blockSize;
    this.bindingPoint = bindingPoint;

    this.bindUniformBlock(programs);
  }

  getDefaultBlockVariableNames(): string[] {
    return [];
  }

  bindUniformBlock(programs: WebGLProgram[]): UniformBufferObject {
    const { gl, blockName, bindingPoint } = this;

    programs.forEach((program) => {
      const blockIndex = gl.getUniformBlockIndex(program, blockName);

      gl.uniformBlockBinding(program, blockIndex, bindingPoint);
    });

    return this;
  }

  updateData(uniformList: UniformListItem_TYPE[]): UniformBufferObject {
    const { gl, blockName, blockVariableInfo } = this;

    uniformList.forEach((uniform) => {
      const { name, value } = uniform;

      const info = blockVariableInfo[name];

      if (!info) {
        console.warn(`No variable named ${name} in uniform block ${blockName}`);
      }

      gl.bufferSubData(
        gl.UNIFORM_BUFFER,
        info.offset,
        new Float32Array(value),
        0
      );
    });

    return this;
  }
}

export class CameraUniformBufferObject extends UniformBufferObject {
  getDefaultBlockVariableNames(): string[] {
    return ["u_ProjectionMatrix", "u_ViewMatrix", "u_CameraPosition"];
  }

  updateCameraData(camera: Camera): UniformBufferObject {
    return this.updateData([
      {
        name: "u_ProjectionMatrix",
        value: camera.projectionMatrix,
        type: "uniformMatrix4fv",
      },
      {
        name: "u_ViewMatrix",
        value: camera.transform.viewMatrix,
        type: "uniformMatrix4fv",
      },
      {
        name: "u_CameraPosition",
        value: camera.transform.position,
        type: "uniform3fv",
      },
    ]);
  }
}
