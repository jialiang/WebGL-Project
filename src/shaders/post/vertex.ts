export default `#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 2) in vec2 a_uv;

out vec2 uv;

void main(void) {
    uv = vec2(a_uv.s, 1.0 - a_uv.t);
    gl_Position = vec4(a_position, 1.0);
}
`;
