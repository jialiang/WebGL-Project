import { ImageDictionary_TYPE } from "./Types";

export const ATTRIBUTES = {
  position: {
    name: "a_position",
    location: 0,
    componentLength: 3,
  },
  normal: {
    name: "a_normal",
    location: 1,
    componentLength: 3,
  },
  uv: {
    name: "a_uv",
    location: 2,
    componentLength: 2,
  },
  color: {
    name: "a_color",
    location: 3,
    componentLength: 4,
  },
};

export const IMAGE_DICTIONARY: ImageDictionary_TYPE[] = [
  {
    name: "pirate",
    type: "image",
    url: "models/pirate-girl/pirate-girl.png",
  },
  {
    name: "hyperdimension",
    type: "video",
    url:
      "videos/Superdimension Neptune VS Sega Hard Girls - Opening Movie (Official).mp4",
  },
  {
    name: "test",
    type: "image",
    url: "images/checker-map.png",
  },
];

export const TEXTURE_TYPE_COUNT = 7;

export const TEXTURE_TYPE_TO_SLOT = {
  diffuse: 0,
  bump: 1,
  displacement: 2,
  specularity: 3,
  roughness: 4,
  cubemap_0: 5,
  cubemap_1: 6,
};

export const SLOT_TO_TEXTURE_TYPE = [
  "Diffuse",
  "Bump",
  "Displacement",
  "Specularity",
  "Roughness",
  "Cubemap_0",
  "Cubemap_1",
];
