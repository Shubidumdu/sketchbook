#version 300 es
precision highp float;

in vec3 v_position;
in vec3 p_position;
in vec3 velocity;
in vec3 normal;
in float noise;

uniform mat4 world;
uniform mat4 worldViewProjection;
uniform float time;

out vec3 vPosition;
out vec3 vNormal;

void main() {
  vec3 position = (p_position + (noise * .8 ) * v_position);
  vPosition = mat3(world)*position;
  vNormal = mat3(world)*normal;

  gl_Position = worldViewProjection * vec4(position, 1.);
}
