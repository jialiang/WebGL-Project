import GL from "./classes/GL";
import Shader from "./classes/Shader";
import RenderLoop from "./classes/RenderLoop";
import { Camera, CameraController } from "./classes/Camera";
import Light, { RotatingLight } from "./classes/Light";
import TextureManager from "./classes/Texture";
import { CameraUniformBufferObject } from "./classes/UniformBufferObject";
import { PickerFrameBufferObject } from "./classes/FrameBufferObject";
import { IMAGE_DICTIONARY, TEXTURE_TYPE_TO_SLOT } from "./classes/Globals";

import Grid from "./classes/primitives/Grid";
import Cube from "./classes/primitives/Cube";
import Quad from "./classes/primitives/Quad";
import ModelLoader from "./classes/primitives/ModelLoader";

import defaultVertexShaderSrc from "./shaders/default/vertex";
import defaultFragmentShaderSrc from "./shaders/default/fragment";

import cubemapVertexShaderSrc from "./shaders/cubemap/vertex";
import cubemapFragmentShaderSrc from "./shaders/cubemap/fragment";

import postVertexShaderSrc from "./shaders/post/vertex";
import postFragmentShaderSrc from "./shaders/post/fragment";

const _ = undefined;

window.addEventListener("load", async () => {
  const gl = new GL("canvas");

  // SHADERS

  const shader = new Shader(
    gl,
    defaultVertexShaderSrc,
    defaultFragmentShaderSrc
  );
  const cubemapShader = new Shader(
    gl,
    cubemapVertexShaderSrc,
    cubemapFragmentShaderSrc
  );
  const postShader = new Shader(gl, postVertexShaderSrc, postFragmentShaderSrc);

  // CAMERAS

  const camera = new Camera(gl);
  new CameraController(gl, camera);

  camera.transform.setTransformation({
    position: [0, 2.5, 4],
    isIncremental: false,
  });

  // UBO

  const cameraUbo = new CameraUniformBufferObject(
    gl,
    [shader.program, cubemapShader.program],
    "Camera"
  );

  // MODELS

  const grid = gl.createVertexArrayObject(Grid.createGridVaoData(gl));
  const cube = gl.createVertexArrayObject(Cube.createCubeVaoData(gl));
  const model = gl.createVertexArrayObject(
    await ModelLoader.fromJson(
      gl,
      "pirate",
      "models/pirate-girl/pirate-girl.json"
    )
  );
  const skybox = gl.createVertexArrayObject(
    Cube.createCubeVaoData(gl, "skybox", 20, true)
  );
  const postQuad = gl.createVertexArrayObject(
    Quad.createQuadVaoData(gl, "postQuad", 2)
  );

  cube.transform.setTransformation({
    position: [2, 0, 0],
  });

  // LIGHTS

  const light = new RotatingLight(gl, _, { position: [0, 2.5, 0] });
  const noLight = new Light(gl, "noLight", {
    ambientStrength: 1,
    diffuseStrength: 0,
    specularStrength: 0,
  });

  // TEXTURES

  const tm = new TextureManager(gl);

  await Promise.all([
    tm.loadTextures(IMAGE_DICTIONARY),
    tm.loadCubeMap("dusk", "images/envmap_violentdays/violentdays"),
    tm.loadCubeMap("night", "images/envmap_grimmnight/grimmnight"),
  ]);

  const dusk = tm.getTexture("dusk");
  const night = tm.getTexture("night");
  const hyperdimension = tm.getTexture("hyperdimension");
  const pirate = tm.getTexture("pirate");
  // const test = tm.getTexture("test");

  if (pirate) model.textures[TEXTURE_TYPE_TO_SLOT.diffuse] = pirate;

  if (hyperdimension) {
    cube.textures[TEXTURE_TYPE_TO_SLOT.diffuse] = hyperdimension;
  }

  if (dusk && night) {
    skybox.textures[TEXTURE_TYPE_TO_SLOT.cubemap_0] = dusk;
    skybox.textures[TEXTURE_TYPE_TO_SLOT.cubemap_1] = night;
  }

  // FBO

  const pickerFbo = new PickerFrameBufferObject(gl, tm, _, 2);

  postQuad.textures[TEXTURE_TYPE_TO_SLOT.diffuse] = pickerFbo.colorBuffers[0];

  // RENDER

  const onBeforeRender = () => {
    console.log("Preparing for rendering...");

    tm.startPlayingVideo();
  };

  const onRender = (speed = 1) => {
    pickerFbo.clearFbo();

    light.onRender(speed);
    cameraUbo.updateCameraData(camera);

    // tm.updateVideoTexture();

    // const hyperdimension = tm.getTexture("hyperdimension");

    // if (hyperdimension) {
    //   cube.textures[TEXTURE_TYPE_TO_SLOT.diffuse] = hyperdimension;
    // }

    pickerFbo.activate();

    cubemapShader.activate();
    cubemapShader.renderModel([skybox]);

    shader.activate();
    shader.renderModel([model], _, light);
    shader.renderModel([grid, cube, light.debugPixel], _, noLight);

    pickerFbo.deactivate();

    postShader.activate();
    postShader.renderModel([postQuad]);
  };

  const renderLoop = new RenderLoop(gl, onRender, onBeforeRender);

  renderLoop.start();
});
