import GL from "../GL";
import { VaoOptions_TYPE } from "../Types";

export default class Grid {
  static createGridVaoData(
    gl: GL,
    name = "grid",
    horizontalCount = 12,
    verticalCount = 12,
    padding = 0.1
  ): VaoOptions_TYPE {
    const positionArray = [];
    const colorArray = [];

    for (let i = 0; i < horizontalCount; i++) {
      const y = ((2 - padding * 2) / (horizontalCount - 1)) * i - (1 - padding);

      positionArray.push(-1 + padding);
      positionArray.push(y);
      positionArray.push(0);

      positionArray.push(1 - padding);
      positionArray.push(y);
      positionArray.push(0);

      colorArray.push(1);
      colorArray.push(0);
      colorArray.push(0);

      colorArray.push(0);
      colorArray.push(1);
      colorArray.push(1);
    }

    for (let i = 0; i < verticalCount; i++) {
      const x = ((2 - padding * 2) / (verticalCount - 1)) * i - (1 - padding);

      positionArray.push(x);
      positionArray.push(-1 + padding);
      positionArray.push(0);

      positionArray.push(x);
      positionArray.push(1 - padding);
      positionArray.push(0);

      colorArray.push(0);
      colorArray.push(1);
      colorArray.push(1);

      colorArray.push(1);
      colorArray.push(0);
      colorArray.push(0);
    }

    return {
      name,
      drawMode: gl.LINES,
      positionArray,
      colorArray,
    };
  }
}
