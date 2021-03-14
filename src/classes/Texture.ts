import GL from "./GL";
import { ImageDictionary_TYPE } from "./Types";

export default class TextureManager {
  gl: GL;

  imageList: Record<string, HTMLImageElement> = {};
  videoList: Record<string, HTMLVideoElement> = {};
  textureList: Record<string, WebGLTexture> = {};

  constructor(gl: GL) {
    this.gl = gl;
  }

  getImage = (name = ""): HTMLImageElement | undefined => this.imageList[name];
  getVideo = (name = ""): HTMLVideoElement | undefined => this.videoList[name];
  getTexture = (name = ""): WebGLTexture | undefined => this.textureList[name];

  getImageFromUrl = async (
    name: string,
    url: string
  ): Promise<TexImageSource> => {
    return new Promise((resolve, reject) => {
      console.log(`Loading image from ${url}`);

      const { imageList } = this;

      if (imageList[url]) resolve(imageList[url]);

      const img = document.createElement("img");
      const startTime = performance.now();

      img.onload = () => {
        const endTime = performance.now();
        const elapsed = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`Image ${url} loaded after ${elapsed} seconds.`);

        if (imageList[name]) delete imageList[name];

        imageList[name] = img;

        resolve(img);
      };

      img.onerror = () => {
        reject(`Error loading image from ${url}.`);
      };

      img.crossOrigin = "anonymous";
      img.src = url;
    });
  };

  getVideoFromUrl = async (
    name: string,
    url: string
  ): Promise<TexImageSource> => {
    return new Promise((resolve, reject) => {
      console.log(`Loading video from ${url}`);

      const { videoList } = this;

      if (videoList[url]) resolve(videoList[url]);

      const video = document.createElement("video");
      const startTime = performance.now();

      video.onloadeddata = () => {
        const endTime = performance.now();
        const elapsed = ((endTime - startTime) / 1000).toFixed(2);

        console.log(
          `Loaded enough of video ${url} to play after ${elapsed} seconds.`
        );

        if (videoList[name]) delete videoList[name];

        videoList[name] = video;

        resolve(video);
      };

      video.onabort = video.onerror = () => {
        reject(`Error loading video from ${url}.`);
      };

      video.crossOrigin = "anonymous";
      video.src = url;
      // video.loop = true;
      video.volume = 0;

      video.load();
    });
  };

  startPlayingVideo = (url?: string): void => {
    const { videoList } = this;

    if (url) {
      if (videoList[url]) videoList[url].play();
      return;
    }

    Object.keys(videoList).forEach((video) => videoList[video].play());
  };

  updateVideoTexture = (name?: string): void => {
    const { videoList } = this;

    if (name && videoList[name]) {
      if (!videoList[name].paused) {
        this.loadTexture(name, videoList[name], false, true);
      }
      return;
    }

    Object.keys(videoList).forEach((name) => {
      if (!videoList[name].paused) {
        this.loadTexture(name, videoList[name], false, true);
      }
    });
  };

  loadTexture = (
    name: string,
    image: TexImageSource | null,
    generateMipmaps = true,
    silent = false,
    flipY = false,
    width = 1,
    height = 1
  ): WebGLTexture => {
    const { gl, textureList } = this;

    if (!silent) console.log(`Creating texture ${name}...`);

    const texture = gl.createTexture();

    if (!texture) throw `Failed to initialize WebGL Texture`;

    // Flip the texture by the Y Position, So 0,0 is bottom left corner.
    if (flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Push image to GPU
    if (image) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
    }

    // Setup up scaling
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Setup down scaling
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      generateMipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR
    );

    // Precalculate different sizes of texture for better quality rendering.
    if (generateMipmaps) gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);

    if (textureList[name]) {
      gl.deleteTexture(textureList[name]);
      delete textureList[name];
    }

    textureList[name] = texture;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    return texture;
  };

  loadTextures = async (
    imageDictionary: ImageDictionary_TYPE[]
  ): Promise<void> => {
    return Promise.all(
      imageDictionary.map(async (imageInfo) => {
        const { name, type, url } = imageInfo;
        let source: TexImageSource | null = null;

        if (type === "image") {
          source = await this.getImageFromUrl(name, url);
        }
        if (type === "video") {
          source = await this.getVideoFromUrl(name, url);
        }

        if (!source) return;

        this.loadTexture(name, source, type === "image");
      })
    )
      .then(() => {
        console.log("Success loading all textures.");
      })
      .catch((e) => {
        console.warn(e);
      });
  };

  loadCubeMap = async (
    name = "cubeMap",
    basePath: string
  ): Promise<WebGLTexture | null> => {
    const { gl, textureList } = this;

    console.log(`Creating texture for cube map ${name}...`);

    // order important: right, left, top, bottom, back, front
    const suffixes = ["ft", "bk", "up", "dn", "rt", "lf"];

    return Promise.all(
      suffixes.map((suffix) => {
        const pathToImage = `${basePath}_${suffix}.png`;
        return this.getImageFromUrl(`${name}_${suffix}`, pathToImage);
      })
    )
      .then((images) => {
        console.log(`Success loading all images for cube map ${name}.`);

        const texture = gl.createTexture();

        if (!texture) throw `Failed to initialize WebGL Texture`;

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        images.forEach((image, index) => {
          gl.texImage2D(
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + index,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
          );
        });

        //Setup up scaling
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        //Setup down scaling
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        //Stretch image to X position
        gl.texParameteri(
          gl.TEXTURE_CUBE_MAP,
          gl.TEXTURE_WRAP_S,
          gl.CLAMP_TO_EDGE
        );

        //Stretch image to Y position
        gl.texParameteri(
          gl.TEXTURE_CUBE_MAP,
          gl.TEXTURE_WRAP_T,
          gl.CLAMP_TO_EDGE
        );

        //Stretch image to Z position
        gl.texParameteri(
          gl.TEXTURE_CUBE_MAP,
          gl.TEXTURE_WRAP_R,
          gl.CLAMP_TO_EDGE
        );

        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

        textureList[name] = texture;

        return texture;
      })
      .catch((e) => {
        console.warn(`Error creating textures for cube map ${name}:\n${e}`);
        return null;
      });
  };
}
