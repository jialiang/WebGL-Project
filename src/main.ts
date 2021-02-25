import GL from "./classes/GL";
import Shader, { CubemapShader } from "./classes/Shader";
import RenderLoop from "./classes/RenderLoop";
import { Camera, CameraController } from "./classes/Camera";

import Grid from "./classes/primitives/Grid";
import Cube from "./classes/primitives/Cube";
import ModelLoader from "./classes/primitives/ModelLoader";

import vertexShaderSrc from "./shaders/default/vertex";
import fragmentShaderSrc from "./shaders/default/fragment";

import cubemapVertexShaderSrc from "./shaders/cubemap/vertex";
import cubemapFragmentShaderSrc from "./shaders/cubemap/fragment";

// const _ = undefined;

window.addEventListener("load", async () => {
  const gl = new GL("canvas");

  const shader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);
  const cubemapShader = new CubemapShader(
    gl,
    cubemapVertexShaderSrc,
    cubemapFragmentShaderSrc
  );

  const camera = new Camera(gl);
  new CameraController(gl, camera);

  const imageDictionary = [
    {
      name: "pirate",
      url: "models/pirate-girl/pirate-girl.png",
    },
  ];

  await gl.loadTextures(imageDictionary);

  const grid = gl.createVertexArrayObject(Grid.createGridVaoData(gl));
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

  await Promise.all([
    gl.loadTextures(imageDictionary),
    gl.loadCubeMap("dusk", "images/envmap_violentdays/violentdays"),
    gl.loadCubeMap("night", "images/envmap_grimmnight/grimmnight"),
  ]);

  const dusk = gl.getTexture("dusk");
  const night = gl.getTexture("night");

  const test = gl.getTexture("pirate");

  if (test) {
    model.textures.push({
      type: "diffuse",
      texture: test,
    });
  }

  if (dusk) {
    skybox.textures.push({
      type: "cubemap",
      texture: dusk,
    });
  }

  if (night) {
    skybox.textures.push({
      type: "cubemap",
      texture: night,
    });
  }

  camera.transformation.setTransformation({
    position: [0, 0, 3],
    isIncremental: false,
  });

  const onBeforeRender = () => {
    console.log("Preparing for rendering...");
  };

  const onRender = () => {
    gl.clearCanvas();

    cubemapShader.activate();
    cubemapShader.renderModel(skybox, camera);

    shader.activate();
    shader.renderModel(grid, camera);
    shader.renderModel(model, camera);
  };

  const renderLoop = new RenderLoop(onRender, onBeforeRender);

  renderLoop.start();
});
