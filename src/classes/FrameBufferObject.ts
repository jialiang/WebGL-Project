import GL from "./GL";
import TextureManager from "./Texture";

const _ = undefined;

export default class FrameBufferObject {
  gl: GL;
  frameBuffer: WebGLFramebuffer;
  renderBuffer: WebGLRenderbuffer;
  colorBuffers: WebGLTexture[];

  constructor(
    gl: GL,
    tm: TextureManager,
    name = "Framebuffer",
    colorBufferCount = 1
  ) {
    console.log(`Creating frame buffer object ${name}...`);

    const canvas = gl.canvas;
    const frameBuffer = gl.createFramebuffer();

    if (!frameBuffer) throw `Error initializing WebGL framebuffer`;

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    const colorBuffers = [];
    const colorAttachments = [];

    for (let index = 0; index < colorBufferCount; index++) {
      const colorBuffer = tm.loadTexture(
        `${name}_ColorBuffer_${index}`,
        null,
        false,
        _,
        _,
        canvas.width,
        canvas.height
      );
      const colorAttachment = gl.COLOR_ATTACHMENT0 + index;

      gl.bindTexture(gl.TEXTURE_2D, colorBuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        colorAttachment,
        gl.TEXTURE_2D,
        colorBuffer,
        0
      );

      colorBuffers.push(colorBuffer);
      colorAttachments.push(colorAttachment);
    }

    if (colorBufferCount > 1) gl.drawBuffers(colorAttachments);

    const renderBuffer = gl.createRenderbuffer();

    if (!renderBuffer) throw `Error initializing WebGL renderbuffer`;

    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
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
    this.colorBuffers = colorBuffers;
    this.renderBuffer = renderBuffer;
  }

  readPixel(x = 0, y = 0, colorBufferIndex = 0): Uint8Array {
    const { gl, frameBuffer } = this;
    const color = new Uint8Array(4);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, frameBuffer);
    gl.readBuffer(gl.COLOR_ATTACHMENT0 + colorBufferIndex);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);

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

  clearFbo(): FrameBufferObject {
    const { gl, frameBuffer } = this;

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return this;
  }

  dispose(): FrameBufferObject {
    const { gl, frameBuffer, colorBuffers, renderBuffer } = this;

    gl.deleteFramebuffer(frameBuffer);
    gl.deleteRenderbuffer(renderBuffer);

    colorBuffers.forEach((colorBuffer) => {
      gl.deleteTexture(colorBuffer);
    });

    return this;
  }
}

export class PickerFrameBufferObject extends FrameBufferObject {
  messageBox: HTMLDivElement;

  constructor(
    gl: GL,
    tm: TextureManager,
    name = "PickerFramebuffer",
    colorBufferCount = 1
  ) {
    super(gl, tm, name, colorBufferCount);

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

    const color = this.readPixel(x, y, 1);
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
}
