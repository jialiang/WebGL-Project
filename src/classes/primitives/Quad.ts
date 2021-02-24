import GL from "../GL";
import { VaoOptions_TYPE } from "../Types";

export default class Quad {
  static createQuadVaoData(gl: GL, name = "quad", size = 0.5): VaoOptions_TYPE {
    // prettier-ignore
    const positionArray = [
      -size,  size, 0,
      -size, -size, 0,
       size, -size, 0,
       size,  size, 0,
    ];

    // prettier-ignore
    const colorArray = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 0.0
    ];

    // prettier-ignore
    const uvArray = [
        0, 0,
        0, 1,
        1, 1,
        1, 0
    ];

    // prettier-ignore
    const indexArray = [
        0, 1, 2,
        2, 3, 0
    ];

    return {
      name,
      drawMode: gl.TRIANGLES,
      positionArray,
      colorArray,
      uvArray,
      indexArray,
    };
  }
}
