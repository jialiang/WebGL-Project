import GL from "./classes/GL";
import Shader, { CubemapShader } from "./classes/Shader";
import RenderLoop from "./classes/RenderLoop";
import { Camera, CameraController } from "./classes/Camera";
import Light, { RotatingLight } from "./classes/Light";
import { IMAGE_DICTIONARY, TEXTURE_TYPE_TO_SLOT } from "./classes/Globals";

import Grid from "./classes/primitives/Grid";
import Cube from "./classes/primitives/Cube";
import ModelLoader from "./classes/primitives/ModelLoader";

import defaultVertexShaderSrc from "./shaders/default/vertex";
import defaultFragmentShaderSrc from "./shaders/default/fragment";

import cubemapVertexShaderSrc from "./shaders/cubemap/vertex";
import cubemapFragmentShaderSrc from "./shaders/cubemap/fragment";

const _ = undefined;

window.addEventListener("load", async () => {
  const gl = new GL("canvas");

  // SHADERS

  const shader = new Shader(
    gl,
    defaultVertexShaderSrc,
    defaultFragmentShaderSrc
  );
  const cubemapShader = new CubemapShader(
    gl,
    cubemapVertexShaderSrc,
    cubemapFragmentShaderSrc
  );

  // CAMERAS

  const camera = new Camera(gl);
  new CameraController(gl, camera);

  camera.transform.setTransformation({
    position: [0, 2.5, 4],
    isIncremental: false,
  });

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

  await Promise.all([
    gl.loadTextures(IMAGE_DICTIONARY),
    gl.loadCubeMap("dusk", "images/envmap_violentdays/violentdays"),
    gl.loadCubeMap("night", "images/envmap_grimmnight/grimmnight"),
  ]);

  const dusk = gl.getTexture("dusk");
  const night = gl.getTexture("night");
  const hyperdimension = gl.getTexture("hyperdimension");
  const test = gl.getTexture("pirate");

  if (test) model.textures[TEXTURE_TYPE_TO_SLOT.diffuse] = test;

  if (hyperdimension)
    cube.textures[TEXTURE_TYPE_TO_SLOT.diffuse] = hyperdimension;

  if (dusk && night) skybox.textures = [dusk, night];

  // RENDER

  const onBeforeRender = () => {
    console.log("Preparing for rendering...");

    gl.startPlayingVideo();
  };

  const onRender = (speed = 1) => {
    gl.clearCanvas();

    light.onRender(speed);

    gl.updateVideoTexture();
    const hyperdimension = gl.getTexture("hyperdimension");
    if (hyperdimension)
      cube.textures[TEXTURE_TYPE_TO_SLOT.diffuse] = hyperdimension;

    cubemapShader.activate();
    cubemapShader.renderModel(skybox, camera);

    shader.activate();
    shader.renderModel(grid, camera, noLight);
    shader.renderModel(model, camera, light);
    shader.renderModel(cube, camera, noLight);
    shader.renderModel(light.debugPixel, camera, noLight);
  };

  const renderLoop = new RenderLoop(onRender, onBeforeRender);

  renderLoop.start();
});
