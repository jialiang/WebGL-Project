import GL from "../GL";
import { VaoOptions_TYPE } from "../Types";

export default class ModelLoader {
  static async fromJson(
    gl: GL,
    name = "model",
    url: string
  ): Promise<VaoOptions_TYPE> {
    console.log(`Preparing ${name} VAO data...`);

    console.log(`Fetching JSON file for ${name} from ${url}...`);

    const startTime = performance.now();

    const response = await fetch(url);

    const endTime = performance.now();
    const elapsed = (endTime - startTime) / 1000;

    console.log(`JSON file for ${name} loaded after ${elapsed} seconds.`);

    const obj = await response.json();

    const attributes = ["position", "normal", "color", "uv", "index"];
    const message: string[] = [];

    attributes.forEach((attribute) => {
      const value = obj[attribute];

      if (value == null && attribute !== "color") {
        message.push(`Missing required attribute ${attribute}.`);
        return;
      }

      if (value != null && !Array.isArray(value)) {
        message.push(`Attribute ${attribute} is not an array.`);
        return;
      }
    });

    if (message.length) {
      throw `Error in JSON response for ${name}:\n${message.join("\n")}`;
    }

    if (!obj.color) obj.color = Array((obj.position.length / 3) * 4).fill(0);

    return {
      name,
      drawMode: gl.TRIANGLES,
      positionArray: obj.position,
      normalArray: obj.normal,
      colorArray: obj.color,
      uvArray: obj.uv,
    };
  }
}
