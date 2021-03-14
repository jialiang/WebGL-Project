import GL from "./GL";
import Shader from "./Shader";
import TextureManager from "./Texture";
import { Model_TYPE } from "./Types";

const _ = undefined;

export default class FrameBufferObject {
  gl: GL;
  frameBuffer: WebGLFramebuffer;
  renderBuffer: WebGLRenderbuffer;
  colorBuffer: WebGLTexture;

  constructor(gl: GL, tm: TextureManager, name = "Framebuffer") {
    console.log(`Creating frame buffer object ${name}...`);

    const canvas = gl.canvas;

    const frameBuffer = gl.createFramebuffer();

    if (!frameBuffer) {
      throw `Error initializing WebGL framebuffer`;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    const colorBuffer = tm.loadTexture(
      name,
      null,
      false,
      _,
      _,
      canvas.width,
      canvas.height
    );
    gl.bindTexture(gl.TEXTURE_2D, colorBuffer);

    const renderBuffer = gl.createRenderbuffer();

    if (!renderBuffer) {
      throw `Error initializing WebGL renderbuffer`;
    }

    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      colorBuffer,
      0
    );

    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      canvas.width,
      canvas.height
    );

    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      renderBuffer
    );

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.gl = gl;
    this.frameBuffer = frameBuffer;
    this.colorBuffer = colorBuffer;
    this.renderBuffer = renderBuffer;
  }

  readPixel(x = 0, y = 0): Uint8Array {
    const { gl, frameBuffer } = this;
    const color = new Uint8Array(4);

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return color;
  }

  activate(): FrameBufferObject {
    const { gl, frameBuffer } = this;

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    return this;
  }

  deactivate(): FrameBufferObject {
    const { gl } = this;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return this;
  }

  clear(): FrameBufferObject {
    const { gl, frameBuffer } = this;

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return this;
  }

  dispose(): FrameBufferObject {
    const { gl, frameBuffer, colorBuffer, renderBuffer } = this;

    gl.deleteFramebuffer(frameBuffer);
    gl.deleteTexture(colorBuffer);
    gl.deleteRenderbuffer(renderBuffer);

    return this;
  }
}

export interface AfterRenderActionFbo extends FrameBufferObject {
  onAfterRender(shader: Shader, model: Model_TYPE): void;
}

export class PickerFrameBufferObject
  extends FrameBufferObject
  implements AfterRenderActionFbo {
  messageBox: HTMLDivElement;

  constructor(gl: GL, tm: TextureManager, name = "Framebuffer") {
    super(gl, tm, name);

    const canvas = gl.canvas;
    const messageBox = document.createElement("div");

    messageBox.className = "picker-fbo-messagebox";
    document.body.appendChild(messageBox);

    this.messageBox = messageBox;

    canvas.addEventListener("mousedown", (e) =>
      this.handleMouseDown(e as MouseEvent)
    );
    canvas.addEventListener("mouseup", () => this.handleMouseUp());
  }

  handleMouseDown(e: MouseEvent): void {
    const { gl, messageBox } = this;
    const { pageX, pageY } = e;

    const x = Math.round(pageX * devicePixelRatio);
    const y = gl.canvas.height - Math.round(pageY * devicePixelRatio);

    const color = this.readPixel(x, y);
    const id = color[0];

    const model = gl.getModelById(id);
    let outputText = `No model at coordinates (${x}, ${y})`;

    if (model) outputText = `Clicked on ${model.name}`;

    messageBox.innerHTML = outputText;
  }

  handleMouseUp(): void {
    const { messageBox } = this;

    messageBox.innerHTML = "";
  }

  onAfterRender(shader: Shader, model: Model_TYPE): void {
    shader.pushUniformsToGpu(
      [
        {
          name: "u_ModelId",
          value: [model.id / 255],
          type: "uniform1f",
        },
      ],
      true
    );

    this.activate();

    shader.draw(model);

    this.deactivate();

    shader.pushUniformsToGpu(
      [
        {
          name: "u_ModelId",
          value: [0.0],
          type: "uniform1f",
        },
      ],
      true
    );
  }
}
