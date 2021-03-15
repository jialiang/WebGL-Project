export default `#version 300 es

precision mediump float;

uniform samplerCube u_Cubemap_0_Texture;
uniform samplerCube u_Cubemap_1_Texture;

uniform float u_Time;

in vec3 uv;

layout(location = 0) out vec4 finalColor_0;
layout(location = 1) out vec4 finalColor_1;

void main(void) {
    finalColor_0 = mix(
        texture(
            u_Cubemap_0_Texture, uv), texture(u_Cubemap_1_Texture, uv), 
            abs(sin(u_Time * 0.0003)
        )
    );
    finalColor_1 = vec4(0, 0, 0, 1);
}
`;
