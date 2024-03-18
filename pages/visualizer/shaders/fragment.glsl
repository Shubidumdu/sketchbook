#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vNormal;

uniform mat4 world;
uniform mat4 worldViewProjection;

out vec4 outColor;

void main() {
  outColor = vec4(vNormal, 1.);
}
