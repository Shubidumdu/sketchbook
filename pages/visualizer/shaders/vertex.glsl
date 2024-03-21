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
uniform float mid;
uniform float low;
uniform float high;

out vec3 vPosition;
out vec3 vNormal;
out vec3 vOuter;

void main() {
  vec3 position = (p_position + (noise * .6) * v_position);
  vec3 outer = normalize(p_position - vec3(0.));
  vPosition = mat3(world)*p_position;
  vNormal = mat3(world)*normal;
  vOuter = mat3(world)*outer;
  float nMid = mid / 255.;
  float nLow = low / 255.;
  float nHigh = high / 255.;
  gl_Position = worldViewProjection * vec4(((.8 + .2 * nLow ) * position + (2. + nMid * 20. + nHigh * 20.) * noise * outer), 1.);
}
