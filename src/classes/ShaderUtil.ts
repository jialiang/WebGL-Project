import GL from "./GL";

export default class ShaderUtil {
  static getShaderSrc = (id = ""): string => {
    const element = document.getElementById(id);

    if (!element) throw `Element with ID ${id} not found.`;

    return element.innerHTML;
  };

  static createShader = (
    gl: GL,
    src: string,
    typeName: "vertex" | "fragment"
  ): WebGLShader => {
    let type: GLenum;

    if (typeName === "vertex") type = gl.VERTEX_SHADER;
    else if (typeName === "fragment") type = gl.FRAGMENT_SHADER;
    else throw `Encountered invalid type name parameter ${typeName}.`;

    const shader = gl.createShader(type);

    if (!shader) throw `Error intializing WebGL2 shader`;

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);

      gl.deleteShader(shader);

      throw `Error compiling ${typeName} shader:\n${log}`;
    }

    console.log(`Success compiling ${typeName} shader`);

    return shader;
  };

  static createProgram = (
    gl: GL,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    doValidate: boolean
  ): WebGLProgram => {
    const program = gl.createProgram();

    if (!program) throw "Error intializing WebGL2 program.";

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);

      gl.deleteProgram(program);

      throw `Error creating shader program:\n${log}`;
    }

    console.log("Success creating shader program");

    if (doValidate) {
      gl.validateProgram(program);

      if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        const log = gl.getProgramInfoLog(program);

        gl.deleteProgram(program);

        throw `Error creating shader program:\n${log}`;
      }

      console.log("Success validating shader program");
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
  };
}
