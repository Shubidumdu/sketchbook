#version 300 es
precision highp float;

uniform mat4 worldView;

in vec4 vPosition;
in vec3 vNormal;

uniform sampler2D textureSampler;
uniform sampler2D refSampler;

out vec4 fragColor;

void main(void) {
  fragColor = vec4(1. * vNormal, 1.0);
}