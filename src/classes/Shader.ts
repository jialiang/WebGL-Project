import GL from "./GL";
import ShaderUtil from "./ShaderUtil";

import { TEXTURE_TYPE_TO_SLOT } from "./Globals";
import { UniformList_TYPE, Model_TYPE, TextureInfo_TYPE } from "./Types";
import { Camera } from "./Camera";
import Light from "./Light";

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
    this.uniformLocations = {};

    if (uniformList) this.pushUniformsToGpu(uniformList);
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

  pushUniformsToGpu(
    uniformList: UniformList_TYPE[],
    programActivated = false
  ): Shader {
    const { gl, program } = this;

    if (!programActivated) this.activate();

    uniformList.forEach((uniform) => {
      const { name, value, type } = uniform;

      let location: WebGLUniformLocation | null = this.uniformLocations[name];

      if (location === "INVALID") return;

      if (!location) {
        location = gl.getUniformLocation(program, name);

        if (location == null) {
          console.warn(`Failed to get location of uniform ${name}.`);
          this.uniformLocations[name] = "INVALID";
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
        case "uniform1fv":
        case "uniform2fv":
        case "uniform3fv":
        case "uniform4fv":
          gl[type](location, value);
          break;
        default:
          gl[type](location, value[0], value[1], value[2], value[3]);
      }
    });

    if (!programActivated) this.deactivate();

    return this;
  }

  pushTexturesToGpu(
    textures: TextureInfo_TYPE[],
    uniformList: UniformList_TYPE[]
  ): void {
    const { gl } = this;

    textures.forEach((textureInfo) => {
      const { type, texture } = textureInfo;

      const slotNumber = TEXTURE_TYPE_TO_SLOT[type];
      const slotName = `TEXTURE${slotNumber}` as keyof GL;
      const slot = gl[slotName] as GLenum;

      if (slot == null) return;

      gl.activeTexture(slot);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      uniformList.push({
        name: `u_${type}Texture`,
        value: [slotNumber],
        type: "uniform1i",
      });
    });

    uniformList.push({
      name: "u_hasTexture",
      value: [textures.length ? 1 : 0],
      type: "uniform1f",
    });
  }

  populateCameraUniforms(
    camera: Camera,
    uniformList: UniformList_TYPE[]
  ): void {
    uniformList.push.apply(uniformList, [
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

  populateLightUniforms(light: Light, uniformList: UniformList_TYPE[]): void {
    uniformList.push.apply(uniformList, [
      {
        name: "u_LightPosition",
        value: light.transform.position,
        type: "uniform3fv",
      },
    ]);
  }

  renderModel(model: Model_TYPE, camera?: Camera, light?: Light): Shader {
    const { gl } = this;
    const {
      vao,
      indexCount,
      vertexCount,
      drawMode,
      transform,
      textures,
    } = model;

    const uniformList: UniformList_TYPE[] = [
      {
        name: "u_ModelViewMatrix",
        value: transform.modelViewMatrix,
        type: "uniformMatrix4fv",
      },
      {
        name: "u_NormalMatrix",
        value: transform.normalMatrix,
        type: "uniformMatrix3fv",
      },
    ];

    if (camera) this.populateCameraUniforms(camera, uniformList);
    if (light) this.populateLightUniforms(light, uniformList);

    this.pushTexturesToGpu(textures, uniformList);
    this.pushUniformsToGpu(uniformList, true);

    gl.bindVertexArray(vao);

    if (indexCount) gl.drawElements(drawMode, indexCount, gl.UNSIGNED_SHORT, 0);
    else gl.drawArrays(drawMode, 0, vertexCount);

    gl.bindVertexArray(null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    return this;
  }
}

export class CubemapShader extends Shader {
  logInitialization(): void {
    console.log("Preparing cubemap shader...");
  }

  pushTexturesToGpu(
    textures: TextureInfo_TYPE[],
    uniformList: UniformList_TYPE[]
  ): void {
    const { gl } = this;

    textures.forEach((textureInfo, index) => {
      const { type, texture } = textureInfo;

      if (type !== "cubemap") return;

      const slotName = `TEXTURE${index}` as keyof GL;
      const slot = gl[slotName] as GLenum;

      gl.activeTexture(slot);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

      uniformList.push({
        name: `u_cubemapTexture_${index}`,
        value: [index],
        type: "uniform1i",
      });
    });

    uniformList.push({
      name: "u_Time",
      value: [performance.now()],
      type: "uniform1f",
    });
  }
}
