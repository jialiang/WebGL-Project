export default `#version 300 es

precision mediump float;

uniform sampler2D u_Diffuse_Texture;

in vec2 uv;

out vec4 finalColor;

void main(void) {
    finalColor = texture(u_Diffuse_Texture, uv);
}
`;
