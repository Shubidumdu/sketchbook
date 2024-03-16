#version 300 es
precision highp float;

in vec3 p_position;
in vec3 p_direction;
in vec3 velocity;
in vec3 normal;

uniform mat4 world;
uniform mat4 worldViewProjection;
uniform float time;

out vec3 vPosition;
out vec3 vNormal;

void main() {
  vPosition = mat3(world)*p_position;
  vNormal = mat3(world)*normal;
  gl_Position = worldViewProjection * vec4(p_position, 1.);
}
