import GL from "../GL";
import { VaoOptions_TYPE } from "../Types";

export default class Grid {
  static createGridVaoData(
    gl: GL,
    name = "grid",
    horizontalCount = 13,
    verticalCount = 13
  ): VaoOptions_TYPE {
    console.log(`Preparing ${name} VAO data...`);

    const positionArray = [];

    const totalVertices = (horizontalCount + verticalCount) * 2;

    const colorArray = Array(totalVertices * 4).fill(1);

    for (let i = 0; i < horizontalCount; i++) {
      const y = (2 / (horizontalCount - 1)) * i - 1;

      positionArray.push(y);
      positionArray.push(0);
      positionArray.push(-1);

      positionArray.push(y);
      positionArray.push(0);
      positionArray.push(1);
    }

    for (let i = 0; i < verticalCount; i++) {
      const x = (2 / (verticalCount - 1)) * i - 1;

      positionArray.push(-1);
      positionArray.push(0);
      positionArray.push(x);

      positionArray.push(1);
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
