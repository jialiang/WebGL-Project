export default `#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;

uniform mat4 u_ModelViewMatrix;

uniform Camera {
    mat4 u_ProjectionMatrix;
    mat4 u_ViewMatrix;
    vec3 u_CameraPosition;
};

out vec3 uv;

void main(void) {
    uv = a_position;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelViewMatrix * vec4(a_position.xyz, 1.0);
}
`;
