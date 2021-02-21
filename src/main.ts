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

  let rotation = 0;
  let scale = 1;
  const model = gl.getModel("grid");

  const onBeforeRender = () => console.log("Before render");
  const onRender = () => {
    gl.clearCanvas();

    if (model) {
      rotation += 0.1;
      scale += 0.001;

      rotation %= 360;
      scale %= 2;

      model.transformation.setTransformation({
        position: [0, 0, -1],
        rotation: [rotation, rotation, rotation],
        scale: [scale, scale, 1],
        isIncremental: false,
      });

      shader.renderModel(model);
    }
  };

  const renderLoop = new RenderLoop(onRender, onBeforeRender);

  renderLoop.start();
});
