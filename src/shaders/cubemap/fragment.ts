export default `#version 300 es

precision mediump float;

uniform samplerCube u_cubemapTexture_0;
uniform samplerCube u_cubemapTexture_1;

uniform float u_Time;

in vec3 uv;

out vec4 finalColor;

void main(void) {
    finalColor = mix(
        texture(
            u_cubemapTexture_0, uv), texture(u_cubemapTexture_1, uv), 
            abs(sin(u_Time * 0.0000)
        )
    );
}
`;
