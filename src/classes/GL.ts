import { ATTRIBUTES, TEXTURE_TYPE_COUNT } from "./Globals";
import { Model_TYPE, VaoOptions_TYPE } from "./Types";
import Transform from "./Transform";

class WebGL2RenderingContextConstructor {
  constructor(id = "") {
    const canvas = document.getElementById(id);

    if (!canvas) throw `Element with ID ${id} not found.`;

    const gl = (canvas as HTMLCanvasElement).getContext("webgl2");

    if (!gl)
      throw `Unable to get canvas WebGL2 context for element with ID ${id}.`;

    console.log("Success creating WebGL2 context.");

    return gl;
  }
}

WebGL2RenderingContext = Object.setPrototypeOf(
  WebGL2RenderingContextConstructor,
  WebGL2RenderingContext.prototype
);

declare global {
  interface Window {
    GL: GL;
  }
}

export default class GL extends WebGL2RenderingContext {
  modelList: Record<string, Model_TYPE> = {};

  constructor(id = "", width = 0, height = 0) {
    // @ts-expect-error WebGL2RenderingContextConstructor used instead of original constructor
    super(id);

    this.cullFace(this.BACK);
    this.frontFace(this.CCW);
    this.enable(this.DEPTH_TEST);
    this.enable(this.CULL_FACE);
    this.depthFunc(this.LEQUAL);
    this.blendFuncSeparate(
      this.SRC_ALPHA,
      this.ONE_MINUS_SRC_ALPHA,
      this.ONE,
      this.ONE_MINUS_SRC_ALPHA
    );
    this.enable(this.BLEND);
    this.clearColor(0.0, 0.0, 0.0, 1.0);

    this.setSize(width, height);
    this.clearCanvas();

    window.GL = this;

    return this;
  }

  getModel = (name = ""): Model_TYPE | undefined => this.modelList[name];

  clearCanvas = (): GL => {
    this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
    return this;
  };

  setSize = (width = 0, height = 0): GL => {
    const canvas = this.canvas as HTMLCanvasElement;

    if (!width || !height) {
      const computedStyle = getComputedStyle(canvas);

      width = parseInt(computedStyle.getPropertyValue("width"), 10);
      height = parseInt(computedStyle.getPropertyValue("height"), 10);
    }

    const realWidth = Math.max(width * devicePixelRatio);
    const realHeight = Math.max(height * devicePixelRatio);

    console.log(
      `Setting size of WebGL canvas to ${width}×${height} physical pixels.`
    );

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = realWidth;
    canvas.height = realHeight;

    this.viewport(0, 0, realWidth, realHeight);

    return this;
  };

  createArrayBuffer = (options: {
    value: number[];

    location?: number;
    componentLength?: number;

    isIndex?: boolean;
    isStatic?: boolean;
  }): WebGLBuffer => {
    const {
      value = [],
      location = 0,
      componentLength = 0,
      isIndex = false,
      isStatic = true,
    } = options;

    const buffer = this.createBuffer();

    if (!buffer) throw "Failed to initialize WebGL buffer.";

    const bufferType = isIndex ? this.ELEMENT_ARRAY_BUFFER : this.ARRAY_BUFFER;
    const bufferArray = isIndex
      ? new Uint16Array(value)
      : new Float32Array(value);
    const drawType = isStatic ? this.STATIC_DRAW : this.DYNAMIC_DRAW;

    this.bindBuffer(bufferType, buffer);
    this.bufferData(bufferType, bufferArray, drawType);

    if (!isIndex) {
      this.enableVertexAttribArray(location);
      this.vertexAttribPointer(
        location,
        componentLength,
        this.FLOAT,
        false,
        0,
        0
      );
    }

    this.bindBuffer(this.ARRAY_BUFFER, null);

    return buffer;
  };

  createVertexArrayObject = (options: VaoOptions_TYPE): Model_TYPE => {
    const {
      name = "default",
      drawMode = this.TRIANGLES,
      positionArray = [],
      normalArray = [],
      uvArray = [],
      colorArray = [],
      indexArray = [],
    } = options;

    console.log(`Creating VAO for ${name}...`);

    const {
      position: positionInfo,
      normal: normalInfo,
      uv: uvInfo,
      color: colorInfo,
    } = ATTRIBUTES;

    const vao = this.createVertexArray();

    if (!vao) throw "Failed to initialize WebGL vertex array object.";

    this.bindVertexArray(vao);

    const obj: Model_TYPE = {
      name,
      drawMode,
      vao,
      indexCount: indexArray.length,
      vertexCount: positionArray.length / positionInfo.componentLength,
      positionBuffer: this.createArrayBuffer({
        value: positionArray,
        ...positionInfo,
      }),
      normalBuffer: this.createArrayBuffer({
        value: normalArray,
        ...normalInfo,
      }),
      uvBuffer: this.createArrayBuffer({ value: uvArray, ...uvInfo }),
      indexBuffer: this.createArrayBuffer({ value: indexArray, isIndex: true }),
      colorBuffer: this.createArrayBuffer({ value: colorArray, ...colorInfo }),
      transform: new Transform(),
      textures: new Array(TEXTURE_TYPE_COUNT).fill(null),
    };

    this.bindVertexArray(null);
    this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, null);

    this.modelList[obj.name] = obj;

    return obj;
  };
}
