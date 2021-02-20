export default `#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;
layout(location = 3) in vec3 a_color;

uniform vec3 u_color[4];

out vec4 color;

void main(void) {
    gl_PointSize = 50.0;
    color = vec4(a_color, 1.0);
    gl_Position = vec4(a_position, 1.0);
}
`;
