import GL from "./GL";
import { UniformList_TYPE, Model_TYPE } from "./Types";
import ShaderUtil from "./ShaderUtil";

export default class Shader {
  gl: GL;
  program: WebGLProgram;
  uniformLocations: Record<string, WebGLUniformLocation>;

  constructor(
    gl: GL,
    vertexShaderSrc: string,
    fragmentShaderSrc: string,

    uniformList?: UniformList_TYPE[]
  ) {
    const vertexShader = ShaderUtil.createShader(gl, vertexShaderSrc, "vertex");
    const fragmentShader = ShaderUtil.createShader(
      gl,
      fragmentShaderSrc,
      "fragment"
    );

    this.gl = gl;
    this.program = ShaderUtil.createProgram(
      gl,
      vertexShader,
      fragmentShader,
      true
    );
    this.uniformLocations = {};

    if (uniformList) this.updateUniform(uniformList);
  }

  updateUniform(
    uniformList: UniformList_TYPE[],
    programActivated = false
  ): Shader {
    const { gl, program } = this;

    if (!programActivated) this.activate();

    uniformList.forEach((uniform) => {
      const { name, value, type } = uniform;

      let location: WebGLUniformLocation | null = this.uniformLocations[name];

      if (!location) {
        location = gl.getUniformLocation(program, name);

        if (!location) {
          console.warn(`Failed to get location of uniform ${name}.`);
          return;
        }

        this.uniformLocations[name] = location;
      }

      if (gl[type].length - 1 !== value.length) {
        console.warn(
          `${type} expects ${gl[type].length - 1} values parameter but found ${
            value.length
          }.`
        );
        return;
      }

      gl[type](location, value[0], value[1], value[2], value[3]);
    });

    if (!programActivated) this.deactivate();

    return this;
  }

  activate(): Shader {
    this.gl.useProgram(this.program);
    return this;
  }

  deactivate(): Shader {
    this.gl.useProgram(null);
    return this;
  }

  dispose(): boolean {
    const { gl, program } = this;

    if (gl.getParameter(gl.CURRENT_PROGRAM) === program) {
      this.deactivate();
      gl.deleteProgram(program);
    }

    return true;
  }

  renderModel(model: Model_TYPE): Shader {
    const { gl } = this;
    const { vao, indexCount, vertexCount, drawMode } = model;

    gl.bindVertexArray(vao);

    if (indexCount) gl.drawElements(drawMode, indexCount, gl.UNSIGNED_SHORT, 0);
    else gl.drawArrays(drawMode, 0, vertexCount);

    gl.bindVertexArray(null);

    return this;
  }
}
