#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;

uniform mat4 world;
uniform mat4 worldViewProjection;

out vec3 vPosition;
out vec3 vNormal;

void main(){
  vPosition=mat3(world)*position;
  vNormal=mat3(world)*normal;
  gl_Position=worldViewProjection*vec4(position,1.);
}
