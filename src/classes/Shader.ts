import GL from "./GL";
import { UniformList_TYPE, Model_TYPE } from "./Types";
import ShaderUtil from "./ShaderUtil";
import { Camera } from "./Camera";

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

      switch (type) {
        case "uniformMatrix2fv":
        case "uniformMatrix3fv":
        case "uniformMatrix4fv":
          gl[type](location, false, value);
          break;
        default:
          gl[type](location, value[0], value[1], value[2], value[3]);
      }
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

  renderModel(model: Model_TYPE, camera: Camera): Shader {
    const { gl, program } = this;
    const {
      vao,
      indexCount,
      vertexCount,
      drawMode,
      transformation,
      texture,
    } = model;

    if (gl.getParameter(gl.CURRENT_PROGRAM) !== program) this.activate();

    const uniformList: UniformList_TYPE[] = [
      {
        name: "u_ModelViewMatrix",
        value: transformation.modelViewMatrix,
        type: "uniformMatrix4fv",
      },
      {
        name: "u_ProjectionMatrix",
        value: camera.projectionMatrix,
        type: "uniformMatrix4fv",
      },
      {
        name: "u_ViewMatrix",
        value: camera.transformation.viewMatrix,
        type: "uniformMatrix4fv",
      },
    ];

    if (texture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      uniformList.push({
        name: "u_Texture",
        value: [0],
        type: "uniform1i",
      });
    }

    uniformList.push({
      name: "u_hasTexture",
      value: [texture ? 1 : 0],
      type: "uniform1f",
    });

    this.updateUniform(uniformList, true);

    gl.bindVertexArray(vao);

    if (indexCount) gl.drawElements(drawMode, indexCount, gl.UNSIGNED_SHORT, 0);
    else gl.drawArrays(drawMode, 0, vertexCount);

    gl.bindVertexArray(null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return this;
  }
}
