#version 300 es
precision highp float;

uniform vec3 reverseLightDirection;

in vec4 vPosition;
in vec3 vNormal;

out vec4 fragColor;

void main(void) {
  vec3 normal = normalize(vNormal);
  float light = dot(normal, reverseLightDirection);
  fragColor = vec4(vec3(1. * light), 1.0);
}