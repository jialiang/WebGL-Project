import GL from "./GL";
import ShaderUtil from "./ShaderUtil";
import UniformManager from "./Uniform";

import { UniformListItem_TYPE, Model_TYPE } from "./Types";
import { Camera } from "./Camera";
import Light from "./Light";

export default class Shader {
  gl: GL;
  program: WebGLProgram;
  um: UniformManager;

  constructor(
    gl: GL,
    vertexShaderSrc: string,
    fragmentShaderSrc: string,
    uniformList?: UniformListItem_TYPE[]
  ) {
    this.logInitialization();

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
    this.um = new UniformManager(gl, this, uniformList);
  }

  logInitialization(): void {
    console.log("Preparing default shader...");
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

  draw(model: Model_TYPE): void {
    const { gl } = this;
    const { drawMode, indexCount, vertexCount } = model;

    if (indexCount) {
      gl.drawElements(drawMode, indexCount, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.drawArrays(drawMode, 0, vertexCount);
    }
  }

  renderModel(models: Model_TYPE[], camera?: Camera, light?: Light): Shader {
    const { gl, um } = this;

    if (camera) um.enqueueCameraUniforms(camera);
    if (light) um.enqueueLightUniforms(light);

    um.enqueueOne({
      name: "u_Time",
      value: [performance.now()],
      type: "uniform1f",
    }).pushUniformsToGpu(true);

    models.forEach((model) => {
      const { vao, transform, textures } = model;

      if (transform) um.enqueueTransformUniforms(transform);
      if (textures) um.enqueueTextureUniforms(textures);

      um.enqueueOne({
        name: "u_ModelId",
        value: [model.id / 255],
        type: "uniform1f",
      });

      um.pushUniformsToGpu(true);

      gl.bindVertexArray(vao);

      this.draw(model);
    });

    gl.bindVertexArray(null);

    return this;
  }
}
