#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vNormal;

uniform mat4 world;
uniform mat4 worldViewProjection;

out vec4 outColor;

const vec3 colorX = vec3(1., 1., 0.);
const vec3 colorY = vec3(0., 1., 1.);
const vec3 colorZ = vec3(1., 0., 1.);

void main() {
  vec3 color = 
    mix(colorX, colorY, vNormal.x) * .4 + 
    mix(colorY, colorZ, vNormal.y) * .4 +
    mix(colorZ, colorX, vNormal.z) * .4;
  outColor = vec4(color, 1.);
}
