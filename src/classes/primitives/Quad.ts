import GL from "../GL";
import { VaoOptions_TYPE } from "../Types";

export default class Quad {
  static createQuadVaoData(gl: GL, name = "quad", size = 1): VaoOptions_TYPE {
    console.log(`Preparing ${name} VAO data...`);

    const halfSize = size / 2;

    // prettier-ignore
    const positionArray = [
      -halfSize,  halfSize, 0,
      -halfSize, -halfSize, 0,
       halfSize, -halfSize, 0,
       halfSize,  halfSize, 0,
    ];

    // prettier-ignore
    const normalArray = [
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1
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
      normalArray,
      colorArray,
      uvArray,
      indexArray,
    };
  }
}
