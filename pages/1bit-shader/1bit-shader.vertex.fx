#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 world;
uniform mat4 worldViewProjection;

out vec4 vPosition;
out vec3 vNormal;
out vec3 vSurfaceToLight;

void main() {
  vec4 p = vec4( position, 1. );
  vPosition = p;
  gl_Position = worldViewProjection * p;
  vNormal = mat3(world) * normal;
}