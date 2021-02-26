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

export const IMAGE_DICTIONARY = [
  {
    name: "pirate",
    url: "models/pirate-girl/pirate-girl.png",
  },
];

export const TEXTURE_TYPE_TO_SLOT = {
  diffuse: 0,
  cubemap: 0,
  normal: 1,
  bump: 1,
  displacement: 2,
  specularity: 3,
  reflection: 3,
  gloss: 4,
  roughness: 4,
};

export default {
  ATTRIBUTES,
  IMAGE_DICTIONARY,
  TEXTURE_TYPE_TO_SLOT,
};
