import GL from "./GL";
import { UniformListItem_TYPE } from "./Types";

export default class UniformBufferObject {
  static INDEX = 0;

  gl: GL;
  uniformBuffer: WebGLBuffer;
  blockName: string;
  blockSize: number;
  bindingPoint: number;
  blockVariableInfo: {
    [key: string]: {
      index: number;
      offset: number;
    };
  };

  constructor(
    gl: GL,
    programs: WebGLProgram[],
    blockName: string,
    blockVariableNames: string[]
  ) {
    this.gl = gl;

    const blockIndex = gl.getUniformBlockIndex(programs[0], blockName);
    const blockSize = gl.getActiveUniformBlockParameter(
      programs[0],
      blockIndex,
      gl.UNIFORM_BLOCK_DATA_SIZE
    );

    const uniformBuffer = gl.createBuffer();

    gl.bindBuffer(gl.UNIFORM_BUFFER, uniformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    const bindingPoint = UniformBufferObject.INDEX;
    UniformBufferObject.INDEX += 1;

    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, bindingPoint);

    const blockVariableIndices = gl.getUniformIndices(
      programs[0],
      blockVariableNames
    );
    const blockVariableOffsets = gl.getActiveUniforms(
      programs[0],
      blockVariableIndices,
      gl.UNIFORM_OFFSET
    );

    const blockVariableInfo = {};

    blockVariableNames.forEach((name, index) => {
      blockVariableInfo[name] = {
        index: blockVariableIndices[index],
        offset: blockVariableOffsets[index],
      };
    });

    this.uniformBuffer = uniformBuffer;
    this.blockName = blockName;
    this.blockSize = blockSize;
    this.bindingPoint = bindingPoint;
    this.blockVariableInfo = blockVariableInfo;

    this.bindUniformBlock(programs);
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
        return this;
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
