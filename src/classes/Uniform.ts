import GL from "./GL";
import Shader from "./Shader";
import Light from "./Light";
import { Camera } from "./Camera";
import Transform from "./Transform";

import { UniformListItem_TYPE } from "./Types";
import { SLOT_TO_TEXTURE_TYPE } from "./Globals";

export default class UniformManager {
  gl: GL;
  shader: Shader;
  uniformLocations: Record<string, WebGLUniformLocation>;
  uniformPushQueue: UniformListItem_TYPE[];

  constructor(gl: GL, shader: Shader, uniformList?: UniformListItem_TYPE[]) {
    this.gl = gl;
    this.shader = shader;
    this.uniformLocations = {};
    this.uniformPushQueue = [];

    if (uniformList) this.enqueue(uniformList).pushUniformsToGpu();
  }

  resetQueue(): UniformManager {
    this.uniformPushQueue = [];
    return this;
  }

  pushUniformsToGpu(programActivated = false): UniformManager {
    const { gl, shader, uniformPushQueue } = this;

    if (!programActivated) shader.activate();

    uniformPushQueue.forEach((uniform) => {
      const { name, value, type } = uniform;

      let location: WebGLUniformLocation | null = this.uniformLocations[name];

      if (location === "INVALID") return;

      if (!location) {
        location = gl.getUniformLocation(shader.program, name);

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

    if (!programActivated) shader.deactivate();

    this.resetQueue();

    return this;
  }

  enqueueOne(uniform: UniformListItem_TYPE): UniformManager {
    const { uniformPushQueue } = this;

    uniformPushQueue.push(uniform);

    return this;
  }

  enqueue(uniforms: UniformListItem_TYPE[]): UniformManager {
    const { uniformPushQueue } = this;

    uniformPushQueue.push(...uniforms);

    return this;
  }

  enqueueTransformUniforms(transform: Transform): UniformManager {
    return this.enqueue([
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
    ]);
  }

  enqueueCameraUniforms(camera: Camera): UniformManager {
    return this.enqueue([
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

  enqueueLightUniforms(light: Light): UniformManager {
    return this.enqueue([
      {
        name: "u_LightPosition",
        value: light.transform.position,
        type: "uniform3fv",
      },
      {
        name: "u_LightColor",
        value: light.color,
        type: "uniform3fv",
      },
      {
        name: "u_AmbientStrength",
        value: [light.ambientStrength],
        type: "uniform1f",
      },
      {
        name: "u_DiffuseStrength",
        value: [light.diffuseStrength],
        type: "uniform1f",
      },
      {
        name: "u_SpecularStrength",
        value: [light.specularStrength],
        type: "uniform1f",
      },
      {
        name: "u_SpecularShininess",
        value: [light.specularShininess],
        type: "uniform1f",
      },
    ]);
  }

  enqueueTextureUniforms(textures: (WebGLTexture | null)[]): UniformManager {
    const { gl } = this;
    let hasTexture = 0;

    textures.forEach((texture, index) => {
      gl.activeTexture(gl.TEXTURE0 + index);

      const textureType = SLOT_TO_TEXTURE_TYPE[index];

      if (textureType.indexOf("Cubemap") < 0) {
        gl.bindTexture(gl.TEXTURE_2D, texture || null);
      } else {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture || null);
      }

      if (texture) {
        hasTexture = 1;

        this.enqueueOne({
          name: `u_${textureType}_Texture`,
          value: [index],
          type: "uniform1i",
        });
      }
    });

    this.enqueueOne({
      name: "u_hasTexture",
      value: [hasTexture],
      type: "uniform1f",
    });

    return this;
  }
}
