export default `#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;
layout(location = 3) in vec4 a_color;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

out vec4 color;
out vec2 uv;

void main(void) {
    color = a_color;
    uv = a_uv;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelViewMatrix * vec4(a_position, 1.0);
}
`;
