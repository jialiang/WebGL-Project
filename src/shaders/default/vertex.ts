export default `#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_uv;
layout(location = 3) in vec4 a_color;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat3 u_NormalMatrix;

uniform vec3 u_CameraPosition;

out vec3 position;
out vec3 normal;
out vec2 uv;
out vec4 color;

out vec3 cameraPosition;

void main(void) {
    position = (u_ModelViewMatrix * vec4(a_position, 1.0)).xyz;
    normal = u_NormalMatrix * a_normal;
    uv = a_uv;
    color = a_color;
    cameraPosition = (inverse(u_ViewMatrix) * vec4(u_CameraPosition, 1.0)).xyz;

    gl_PointSize = 50.0;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelViewMatrix * vec4(a_position.xyz, 1.0);
}
`;
