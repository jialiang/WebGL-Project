import GL from "./classes/GL";
import Shader from "./classes/Shader";
import RenderLoop from "./classes/RenderLoop";
import { Camera, CameraController } from "./classes/Camera";

import Grid from "./classes/primitives/Grid";
import Quad from "./classes/primitives/Quad";

import vertexShaderSrc from "./shaders/vertex";
import fragmentShaderSrc from "./shaders/fragment";

window.addEventListener("load", async () => {
  const gl = new GL("canvas");

  const shader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);

  const camera = new Camera(gl);
  new CameraController(gl, camera);

  const imageDictionary = [
    {
      name: "test",
      url: "images/checker-map.png",
    },
  ];

  await Promise.all(
    imageDictionary.map((imageInfo) =>
      gl
        .getImageFromUrl(imageInfo.url)
        .then((imageSource) => gl.loadTexture(imageInfo.name, imageSource))
    )
  )
    .then(() => {
      console.log("Success loading all textures.");
    })
    .catch((e) => {
      console.warn(e);
    });

  const grid = gl.createVertexArrayObject(Grid.createGridVaoData(gl));
  const quad = gl.createVertexArrayObject(Quad.createQuadVaoData(gl));

  quad.texture = gl.getTexture("test");

  camera.transformation.setTransformation({
    position: [0, 0, 3],
    isIncremental: false,
  });

  const onBeforeRender = () => {
    console.log("Preparing for rendering...");
  };

  const onRender = () => {
    gl.clearCanvas();

    shader.renderModel(grid, camera);
    shader.renderModel(quad, camera);
  };

  const renderLoop = new RenderLoop(onRender, onBeforeRender);

  renderLoop.start();
});
