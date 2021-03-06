export default `#version 300 es

precision mediump float;

uniform float u_ModelId;

uniform float u_hasTexture;
uniform sampler2D u_Diffuse_Texture;

uniform vec3 u_LightPosition;
uniform vec3 u_LightColor;

uniform float u_AmbientStrength;
uniform float u_DiffuseStrength;
uniform float u_SpecularStrength;
uniform float u_SpecularShininess;

in vec3 position;
in vec3 normal;
in vec2 uv;
in vec4 color;

in vec3 cameraPosition;

layout(location = 0) out vec4 finalColor_0;
layout(location = 1) out vec4 finalColor_1;

void main(void) {
    vec4 baseColor = u_hasTexture * texture(u_Diffuse_Texture, uv) - (u_hasTexture - 1.0) * color;

    // vec3 lowpolyNormal = normalize(cross(dFdx(position), dFdy(position)));

    vec3 lightDirection = normalize(u_LightPosition - position);
    vec3 cameraDirection = normalize(cameraPosition - position);
    vec3 reflectionDirection = reflect(-lightDirection, normal);

    float lightNormalAngleDiff = max(dot(normal, lightDirection), 0.0);
    float reflectionCameraAngleDiff = max(dot(reflectionDirection, cameraDirection), 0.0);

    vec3 ambientColor = u_AmbientStrength * u_LightColor;
    vec3 diffuseColor = u_DiffuseStrength * u_LightColor * lightNormalAngleDiff;
    vec3 specularColor = u_SpecularStrength * u_LightColor * pow(reflectionCameraAngleDiff, u_SpecularShininess);

    finalColor_0 = vec4(baseColor.rgb * (ambientColor + diffuseColor + specularColor), baseColor.a);
    finalColor_1 = vec4(u_ModelId, 0.0, 0.0, 1.0);
}
`;
