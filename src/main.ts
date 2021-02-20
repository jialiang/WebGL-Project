import GL from "./classes/GL";
import Shader from "./classes/Shader";
import RenderLoop from "./classes/RenderLoop";

import Grid from "./classes/primitives/Grid";

import vertexShaderSrc from "./shaders/vertex";
import fragmentShaderSrc from "./shaders/fragment";

window.addEventListener("load", () => {
  const gl = new GL("canvas");

  const shader = new Shader(gl, vertexShaderSrc, fragmentShaderSrc);

  gl.createVertexArrayObject(Grid.createGridVaoData(gl));

  const onBeforeRender = () => shader.activate();
  const onRender = () => {
    gl.clearCanvas();

    const model = gl.getModel("grid");

    if (model) shader.renderModel(model);
  };

  const renderLoop = new RenderLoop(onRender, onBeforeRender);

  renderLoop.start();
});
