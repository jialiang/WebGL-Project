import GL from "./GL";
import TextureManager from "./Texture";

export default class FrameBufferObject {
  gl: GL;
  tm: TextureManager;
  name: string;
  framebuffer: WebGLFramebuffer;
  colorbuffers: WebGLTexture[] | WebGLRenderbuffer[];
  colorAttachments: GLenum[];
  depthbuffer?: WebGLRenderbuffer;
  msaa: number;

  constructor(gl: GL, tm: TextureManager, name = "Framebuffer", msaa = 0) {
    console.log(`Creating frame buffer object ${name}...`);

    const framebuffer = gl.createFramebuffer();

    if (!framebuffer) throw `Error initializing WebGL framebuffer`;

    this.gl = gl;
    this.tm = tm;
    this.name = name;
    this.framebuffer = framebuffer;
    this.colorbuffers = [];
    this.colorAttachments = [];
    this.msaa = msaa;
  }

  draw(drawFunc: () => void): FrameBufferObject {
    const { gl, framebuffer, colorAttachments } = this;

    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);
    gl.drawBuffers(colorAttachments);

    gl.clearCanvas();
    drawFunc();

    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

    return this;
  }

  copyTo(
    targetFbo: WebGLFramebuffer | null,
    colorbufferIndex = 0
  ): FrameBufferObject {
    const { gl, framebuffer: sourceFbo } = this;
    const canvas = gl.canvas;

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, sourceFbo);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, targetFbo);

    gl.readBuffer(gl.COLOR_ATTACHMENT0 + colorbufferIndex);

    const drawAttachments = [];

    for (let index = 0; index <= colorbufferIndex; index++) {
      if (index === colorbufferIndex) {
        drawAttachments.push(gl.COLOR_ATTACHMENT0 + index);
      } else {
        drawAttachments.push(gl.NONE);
      }
    }

    gl.drawBuffers(drawAttachments);

    gl.blitFramebuffer(
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height,
      gl.COLOR_BUFFER_BIT,
      gl.LINEAR
    );

    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);

    return this;
  }

  addColorBuffers(colorbufferCount = 1): FrameBufferObject {
    const { gl, tm, framebuffer, name, msaa } = this;
    const canvas = gl.canvas;

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const colorbuffers = [];
    const colorAttachments = [];

    for (let index = 0; index < colorbufferCount; index++) {
      let colorbuffer;
      const colorAttachment = gl.COLOR_ATTACHMENT0 + index;

      if (msaa > 0) {
        colorbuffer = gl.createRenderbuffer();

        if (!colorbuffer) throw `Error initializing WebGL renderbuffer`;

        gl.bindRenderbuffer(gl.RENDERBUFFER, colorbuffer);
        gl.renderbufferStorageMultisample(
          gl.RENDERBUFFER,
          msaa,
          gl.RGBA8,
          canvas.width,
          canvas.height
        );
        gl.framebufferRenderbuffer(
          gl.FRAMEBUFFER,
          colorAttachment,
          gl.RENDERBUFFER,
          colorbuffer
        );
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      } else {
        colorbuffer = tm.loadTexture({
          name: `${name}_ColorBuffer_${index}`,
          image: null,
          generateMipmaps: false,
          width: canvas.width,
          height: canvas.height,
        });

        gl.bindTexture(gl.TEXTURE_2D, colorbuffer);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          colorAttachment,
          gl.TEXTURE_2D,
          colorbuffer,
          0
        );
        gl.bindTexture(gl.TEXTURE_2D, null);
      }

      colorbuffers.push(colorbuffer);
      colorAttachments.push(colorAttachment);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.colorbuffers = colorbuffers;
    this.colorAttachments = colorAttachments;

    return this;
  }

  addDepthbuffer(): FrameBufferObject {
    const { gl, framebuffer, msaa } = this;
    const canvas = gl.canvas;

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    if (this.depthbuffer) return this;

    const depthbuffer = gl.createRenderbuffer();

    if (!depthbuffer) throw `Error initializing WebGL renderbuffer`;

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer);

    if (msaa > 0) {
      gl.renderbufferStorageMultisample(
        gl.RENDERBUFFER,
        msaa,
        gl.DEPTH_COMPONENT16,
        canvas.width,
        canvas.height
      );
    } else {
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        canvas.width,
        canvas.height
      );
    }

    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthbuffer
    );
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.depthbuffer = depthbuffer;

    return this;
  }

  readPixel(x = 0, y = 0, colorbufferIndex = 0): Uint8Array {
    const { gl, framebuffer } = this;
    const color = new Uint8Array(4);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, framebuffer);
    gl.readBuffer(gl.COLOR_ATTACHMENT0 + colorbufferIndex);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);

    return color;
  }
}

export class PickerFrameBufferObject extends FrameBufferObject {
  messageBox: HTMLDivElement;

  constructor(
    gl: GL,
    tm: TextureManager,
    name = "PickerFramebuffer",
    msaa = 0
  ) {
    super(gl, tm, name, msaa);

    this.addColorBuffers(2);

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
