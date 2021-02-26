export default `#version 300 es

precision mediump float;

uniform float u_hasTexture;
uniform vec3 u_LightPosition;

uniform sampler2D u_diffuseTexture;

in vec3 position;
in vec3 normal;
in vec2 uv;
in vec4 color;

in vec3 cameraPosition;

out vec4 finalColor;

void main(void) {
    vec4 baseColor = u_hasTexture * texture(u_diffuseTexture, uv) - (u_hasTexture - 1.0) * color;
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    vec3 lightDirection = normalize(u_LightPosition - position);
    vec3 cameraDirection = normalize(cameraPosition - position);
    vec3 reflectionDirection = reflect(-lightDirection, normal);

    float lightNormalAngleDiff = max(dot(normal, lightDirection), 0.0);
    float reflectionCameraAngleDiff = max(dot(reflectionDirection, cameraDirection), 0.0);

    float ambientStrength = 0.15;
    float diffuseStrength = 0.70;
    float specularStrength = 0.15;
    float specularShininess = 256.0;

    vec3 ambientColor = ambientStrength * lightColor;
    vec3 diffuseColor = diffuseStrength * lightColor * lightNormalAngleDiff;
    vec3 specularColor = specularStrength * lightColor * pow( reflectionCameraAngleDiff, specularShininess);

    finalColor = vec4(baseColor.rgb * (ambientColor + diffuseColor + specularColor), baseColor.a);
}
`;
