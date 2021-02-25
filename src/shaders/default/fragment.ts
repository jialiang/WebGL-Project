export default `#version 300 es

precision mediump float;

uniform float u_hasTexture;

uniform sampler2D u_diffuseTexture;

in vec4 color;
in vec2 uv;

out vec4 finalColor;

void main(void) {
    finalColor = u_hasTexture * texture(u_diffuseTexture, uv) - (u_hasTexture - 1.0) * color;
}
`;
