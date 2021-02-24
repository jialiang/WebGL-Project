import GL from "../GL";
import { VaoOptions_TYPE } from "../Types";

export default class Grid {
  static createGridVaoData(
    gl: GL,
    name = "grid",
    horizontalCount = 13,
    verticalCount = 13,
    padding = 0
  ): VaoOptions_TYPE {
    const positionArray = [];

    const totalVertices = (horizontalCount + verticalCount) * 2;

    const colorArray = Array(totalVertices * 4).fill(1);
    const uvArray = Array(totalVertices * 4).fill(0);

    for (let i = 0; i < horizontalCount; i++) {
      const y = ((2 - padding * 2) / (horizontalCount - 1)) * i - (1 - padding);

      positionArray.push(y);
      positionArray.push(0);
      positionArray.push(-1 + padding);

      positionArray.push(y);
      positionArray.push(0);
      positionArray.push(1 - padding);
    }

    for (let i = 0; i < verticalCount; i++) {
      const x = ((2 - padding * 2) / (verticalCount - 1)) * i - (1 - padding);

      positionArray.push(-1 + padding);
      positionArray.push(0);
      positionArray.push(x);

      positionArray.push(1 - padding);
      positionArray.push(0);
      positionArray.push(x);
    }

    return {
      name,
      drawMode: gl.LINES,
      positionArray,
      colorArray,
      uvArray,
    };
  }
}
