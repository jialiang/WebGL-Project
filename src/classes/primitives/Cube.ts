import GL from "../GL";
import { VaoOptions_TYPE } from "../Types";
import Quad from "./Quad";

export default class Cube {
  static createCubeVaoData(
    gl: GL,
    name = "cube",
    size = 1,
    insideOut = false
  ): VaoOptions_TYPE {
    console.log(`Preparing ${name} VAO data...`);

    const sides = [];

    for (let i = 0; i < 6; i++) {
      sides.push(Quad.createQuadVaoData(gl, `${name}_side-${i}`, size));
    }

    if (insideOut) {
      generateInsideOutPosition(sides, size / 2);
    } else {
      generateNormalPosition(sides, size / 2);
    }

    const positionArray = sides.reduce(
      (total, side) => total.concat(side.positionArray),
      [] as number[]
    );

    const normalArray = sides.reduce(
      (total, side) => total.concat(side.normalArray),
      [] as number[]
    );

    const colorArray = sides.reduce(
      (total, side) => total.concat(side.colorArray),
      [] as number[]
    );

    const uvArray = sides.reduce(
      (total, side) => total.concat(side.uvArray),
      [] as number[]
    );

    const indexArray = sides.reduce((total, side, index) => {
      if (!side.indexArray) return total;

      return total.concat(
        side.indexArray.map((i) => i + (index * side.positionArray.length) / 3)
      );
    }, [] as number[]);

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

const generateNormalPosition = (sides: VaoOptions_TYPE[], halfSize: number) => {
  for (let i = 0; i < sides[0].positionArray.length; i += 3) {
    const x = i;
    const y = i + 1;
    const z = i + 2;

    // front
    sides[0].positionArray[z] += halfSize;

    // bottom
    sides[1].positionArray[z] = sides[1].positionArray[y];
    sides[1].positionArray[y] = -halfSize;

    sides[1].normalArray[x] = 0;
    sides[1].normalArray[y] = -1;
    sides[1].normalArray[z] = 0;

    // left
    sides[2].positionArray[z] = sides[2].positionArray[x];
    sides[2].positionArray[x] = -halfSize;

    sides[2].normalArray[x] = -1;
    sides[2].normalArray[y] = 0;
    sides[2].normalArray[z] = 0;

    // right
    sides[3].positionArray[z] = -sides[3].positionArray[x];
    sides[3].positionArray[x] = halfSize;

    sides[3].normalArray[x] = 1;
    sides[3].normalArray[y] = 0;
    sides[3].normalArray[z] = 0;

    // top
    sides[4].positionArray[z] = -sides[4].positionArray[y];
    sides[4].positionArray[y] = halfSize;

    sides[4].normalArray[x] = 0;
    sides[4].normalArray[y] = 1;
    sides[4].normalArray[z] = 0;

    // back
    sides[5].positionArray[x] *= -1;
    sides[5].positionArray[z] -= halfSize;

    sides[5].normalArray[x] = 0;
    sides[5].normalArray[y] = 0;
    sides[5].normalArray[z] = -1;
  }
};

const generateInsideOutPosition = (
  sides: VaoOptions_TYPE[],
  halfSize: number
) => {
  for (let i = 0; i < sides[0].positionArray.length; i += 3) {
    const x = i;
    const y = i + 1;
    const z = i + 2;

    // front
    sides[0].positionArray[z] -= halfSize;

    // top
    sides[1].positionArray[z] = sides[1].positionArray[y];
    sides[1].positionArray[y] = halfSize;

    sides[1].normalArray[x] = 0;
    sides[1].normalArray[y] = -1;
    sides[1].normalArray[z] = 0;

    // right
    sides[2].positionArray[z] = sides[2].positionArray[x];
    sides[2].positionArray[x] = halfSize;

    sides[2].normalArray[x] = -1;
    sides[2].normalArray[y] = 0;
    sides[2].normalArray[z] = 0;

    // left
    sides[3].positionArray[z] = -sides[3].positionArray[x];
    sides[3].positionArray[x] = -halfSize;

    sides[3].normalArray[x] = 1;
    sides[3].normalArray[y] = 0;
    sides[3].normalArray[z] = 0;

    // bottom
    sides[4].positionArray[z] = -sides[4].positionArray[y];
    sides[4].positionArray[y] = -halfSize;

    sides[4].normalArray[x] = 0;
    sides[4].normalArray[y] = 1;
    sides[4].normalArray[z] = 0;

    // back
    sides[5].positionArray[x] *= -1;
    sides[5].positionArray[z] += halfSize;

    sides[5].normalArray[x] = 0;
    sides[5].normalArray[y] = 0;
    sides[5].normalArray[z] = -1;
  }
};
