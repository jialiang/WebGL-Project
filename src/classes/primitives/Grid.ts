import GL from "../GL";
import { VaoOptions_TYPE } from "../Types";

export default class Grid {
  static createGridVaoData(
    gl: GL,
    name = "grid",
    size = 2,
    horizontalCount = 13,
    verticalCount = 13
  ): VaoOptions_TYPE {
    console.log(`Preparing ${name} VAO data...`);

    const halfSize = size / 2;
    const positionArray = [];

    const totalVertices = (horizontalCount + verticalCount) * 2;

    const colorArray = Array(totalVertices * 4).fill(1);

    for (let i = 0; i < horizontalCount; i++) {
      const y = (size / (horizontalCount - 1)) * i - halfSize;

      positionArray.push(y);
      positionArray.push(0);
      positionArray.push(-halfSize);

      positionArray.push(y);
      positionArray.push(0);
      positionArray.push(halfSize);
    }

    for (let i = 0; i < verticalCount; i++) {
      const x = (size / (verticalCount - 1)) * i - halfSize;

      positionArray.push(-halfSize);
      positionArray.push(0);
      positionArray.push(x);

      positionArray.push(halfSize);
      positionArray.push(0);
      positionArray.push(x);
    }

    const normalArray = Array(positionArray.length / 3)
      .fill(0)
      .reduce((total) => {
        total.push(0);
        total.push(1);
        total.push(0);
        return total;
      }, []);

    const uvArray = positionArray;

    return {
      name,
      drawMode: gl.LINES,
      positionArray,
      normalArray,
      colorArray,
      uvArray,
    };
  }
}
